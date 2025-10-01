package main

import (
"encoding/json"
"net/http"
"time"
)

type DayCount struct {
Day   string `json:"day"`
Count int    `json:"count"`
}
type PageCount struct {
Page  string `json:"page"`
Count int    `json:"count"`
}
type IPCount struct {
IP    string `json:"ip"`
Count int    `json:"count"`
}
type ContactOut struct {
ID        int       `json:"id"`
Name      string    `json:"name"`
Email     string    `json:"email"`
Message   string    `json:"message"`
Page      string    `json:"page"`
IPAddress string    `json:"ip_address"`
CreatedAt time.Time `json:"created_at"`
}

func sseHandler(w http.ResponseWriter, r *http.Request) {
w.Header().Set("Content-Type", "text/event-stream")
w.Header().Set("Cache-Control", "no-cache")
w.Header().Set("Connection", "keep-alive")
flusher, ok := w.(http.Flusher)
if !ok { http.Error(w, "stream unsupported", 500); return }

ticker := time.NewTicker(5 * time.Second)
defer ticker.Stop()
ctx := r.Context()

for {
select {
case <-ctx.Done():
return
case <-ticker.C:
db, err := openDB()
if err != nil { continue }
var stats AdminStats
_ = db.QueryRow(`SELECT COUNT(*) FROM visitor_logs WHERE page_visited NOT LIKE '/api/%'`).Scan(&stats.TotalVisitors)
_ = db.QueryRow(`SELECT COUNT(DISTINCT ip_address) FROM visitor_logs`).Scan(&stats.UniqueVisitors)
_ = db.QueryRow(`SELECT COUNT(*) FROM visitor_logs`).Scan(&stats.PageViews)
_ = db.QueryRow(`SELECT COALESCE(AVG(session_duration),0) FROM visitor_logs`).Scan(&stats.AvgSession)
_ = db.Close()

b, _ := json.Marshal(stats)
_, _ = w.Write([]byte("event: stats\ndata: " + string(b) + "\n\n"))
flusher.Flush()
}
}
}

func dailyStatsHandler(w http.ResponseWriter, r *http.Request) {
db, err := openDB()
if err != nil { http.Error(w, "db", 500); return }
defer db.Close()

rows, err := db.Query(`
SELECT strftime('%Y-%m-%d', visit_time) AS d, COUNT(*) AS n
FROM visitor_logs
WHERE page_visited NOT LIKE '/api/%'
GROUP BY d
ORDER BY d DESC
LIMIT 30`)
if err != nil { http.Error(w, "query", 500); return }
defer rows.Close()

var out []DayCount
for rows.Next() {
var d DayCount
_ = rows.Scan(&d.Day, &d.Count)
out = append(out, d)
}
w.Header().Set("Content-Type", "application/json")
_ = json.NewEncoder(w).Encode(out)
}

func topPagesHandler(w http.ResponseWriter, r *http.Request) {
db, err := openDB()
if err != nil { http.Error(w, "db", 500); return }
defer db.Close()

rows, err := db.Query(`
SELECT page_visited, COUNT(*) AS n
FROM visitor_logs
WHERE page_visited NOT LIKE '/api/%'
GROUP BY page_visited
ORDER BY n DESC
LIMIT 20`)
if err != nil { http.Error(w, "query", 500); return }
defer rows.Close()

var out []PageCount
for rows.Next() {
var p PageCount
_ = rows.Scan(&p.Page, &p.Count)
out = append(out, p)
}
w.Header().Set("Content-Type", "application/json")
_ = json.NewEncoder(w).Encode(out)
}

func topVisitorsHandler(w http.ResponseWriter, r *http.Request) {
db, err := openDB()
if err != nil { http.Error(w, "db", 500); return }
defer db.Close()

rows, err := db.Query(`
SELECT ip_address, COUNT(*) AS n
FROM visitor_logs
GROUP BY ip_address
ORDER BY n DESC
LIMIT 20`)
if err != nil { http.Error(w, "query", 500); return }
defer rows.Close()

var out []IPCount
for rows.Next() {
var ip IPCount
_ = rows.Scan(&ip.IP, &ip.Count)
out = append(out, ip)
}
w.Header().Set("Content-Type", "application/json")
_ = json.NewEncoder(w).Encode(out)
}

func contactsListHandler(w http.ResponseWriter, r *http.Request) {
if r.Method != http.MethodGet { http.Error(w, "method", 405); return }
db, err := openDB()
if err != nil { http.Error(w, "db", 500); return }
defer db.Close()

_, _ = db.Exec(`CREATE TABLE IF NOT EXISTS contact_messages (
id INTEGER PRIMARY KEY AUTOINCREMENT,
name TEXT, email TEXT, message TEXT, page TEXT, ip_address TEXT,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`)

rows, err := db.Query(`SELECT id,name,email,message,page,ip_address,created_at
FROM contact_messages ORDER BY created_at DESC LIMIT 200`)
if err != nil { http.Error(w, "query", 500); return }
defer rows.Close()

var out []ContactOut
for rows.Next() {
var c ContactOut
_ = rows.Scan(&c.ID,&c.Name,&c.Email,&c.Message,&c.Page,&c.IPAddress,&c.CreatedAt)
out = append(out, c)
}
w.Header().Set("Content-Type", "application/json")
_ = json.NewEncoder(w).Encode(out)
}
