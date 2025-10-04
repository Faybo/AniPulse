package main

import (
"database/sql"
"encoding/json"
"log"
"net/http"
"strings"
"time"

_ "github.com/glebarez/sqlite"
)

const dbPath = "/root/seanime-project/data-dev/seanime.db"

type AdminStats struct {
TotalVisitors  int `json:"totalVisitors"`
UniqueVisitors int `json:"uniqueVisitors"`
PageViews      int `json:"pageViews"`
AvgSession     int `json:"avgSession"`
}
type VisitorLog struct {
IPAddress       string    `json:"ip_address"`
UserAgent       string    `json:"user_agent"`
PageVisited     string    `json:"page_visited"`
VisitTime       time.Time `json:"visit_time"`
SessionDuration int       `json:"session_duration"`
Country         string    `json:"country"`
City            string    `json:"city"`
Referrer        string    `json:"referrer"`
}
type AdminMessage struct {
ID        string    `json:"id"`
Title     string    `json:"title"`
Content   string    `json:"content"`
Type      string    `json:"type"`
IsActive  bool      `json:"isActive"`
CreatedAt time.Time `json:"createdAt"`
}
type CountryCount struct {
Country string `json:"country"`
Count   int    `json:"count"`
}

func openDB() (*sql.DB, error) {
return sql.Open("sqlite", dbPath)
}

func createTables() {
db, err := openDB()
if err != nil {
log.Println("db open:", err)
return
}
defer db.Close()

_, _ = db.Exec(`
CREATE TABLE IF NOT EXISTS visitor_logs (
id INTEGER PRIMARY KEY AUTOINCREMENT,
ip_address TEXT,
user_agent TEXT,
page_visited TEXT,
visit_time DATETIME DEFAULT CURRENT_TIMESTAMP,
session_duration INTEGER DEFAULT 0,
country TEXT,
city TEXT,
referrer TEXT
)`)
_, _ = db.Exec(`
CREATE TABLE IF NOT EXISTS admin_messages (
id TEXT PRIMARY KEY,
title TEXT,
content TEXT,
type TEXT DEFAULT 'info',
is_active INTEGER DEFAULT 1,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`)
_, _ = db.Exec(`
CREATE TABLE IF NOT EXISTS contact_messages (
id INTEGER PRIMARY KEY AUTOINCREMENT,
name TEXT,
email TEXT,
message TEXT,
page TEXT,
ip_address TEXT,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`)
}

func adminStatsHandler(w http.ResponseWriter, r *http.Request) {
db, err := openDB()
if err != nil { http.Error(w, "db", 500); return }
defer db.Close()

var stats AdminStats
_ = db.QueryRow(`SELECT COUNT(*) FROM visitor_logs`).Scan(&stats.PageViews)
_ = db.QueryRow(`SELECT COUNT(DISTINCT ip_address) FROM visitor_logs`).Scan(&stats.UniqueVisitors)
// Aproximação simples: totalVisitors = visitas a páginas "visíveis"
_ = db.QueryRow(`SELECT COUNT(*) FROM visitor_logs WHERE page_visited NOT LIKE '/api/%'`).Scan(&stats.TotalVisitors)
_ = db.QueryRow(`SELECT COALESCE(AVG(session_duration),0) FROM visitor_logs`).Scan(&stats.AvgSession)

w.Header().Set("Content-Type", "application/json")
_ = json.NewEncoder(w).Encode(stats)
}

func adminVisitorsHandler(w http.ResponseWriter, r *http.Request) {
db, err := openDB()
if err != nil { http.Error(w, "db", 500); return }
defer db.Close()

rows, err := db.Query(`
SELECT ip_address,user_agent,page_visited,visit_time,session_duration,country,city,referrer
FROM visitor_logs
ORDER BY visit_time DESC
LIMIT 50`)
if err != nil { http.Error(w, "query", 500); return }
defer rows.Close()

var list []VisitorLog
for rows.Next() {
var v VisitorLog
_ = rows.Scan(&v.IPAddress,&v.UserAgent,&v.PageVisited,&v.VisitTime,&v.SessionDuration,&v.Country,&v.City,&v.Referrer)
list = append(list, v)
}
w.Header().Set("Content-Type", "application/json")
_ = json.NewEncoder(w).Encode(map[string]any{"visitors": list})
}

func visitorsByIPHandler(w http.ResponseWriter, r *http.Request) {
ip := strings.TrimSpace(r.URL.Query().Get("ip"))
if ip == "" { http.Error(w, "ip required", 400); return }

db, err := openDB()
if err != nil { http.Error(w, "db", 500); return }
defer db.Close()

rows, err := db.Query(`
SELECT ip_address,user_agent,page_visited,visit_time,session_duration,country,city,referrer
FROM visitor_logs
WHERE ip_address = ?
ORDER BY visit_time DESC
LIMIT 200`, ip)
if err != nil { http.Error(w, "query", 500); return }
defer rows.Close()

var list []VisitorLog
for rows.Next() {
var v VisitorLog
_ = rows.Scan(&v.IPAddress,&v.UserAgent,&v.PageVisited,&v.VisitTime,&v.SessionDuration,&v.Country,&v.City,&v.Referrer)
list = append(list, v)
}
w.Header().Set("Content-Type", "application/json")
_ = json.NewEncoder(w).Encode(map[string]any{"visitors": list})
}

func topCountriesHandler(w http.ResponseWriter, r *http.Request) {
db, err := openDB()
if err != nil { http.Error(w, "db", 500); return }
defer db.Close()

rows, err := db.Query(`
SELECT COALESCE(NULLIF(country,''),'Unknown') AS c, COUNT(*) AS n
FROM visitor_logs
GROUP BY c
ORDER BY n DESC
LIMIT 20`)
if err != nil { http.Error(w, "query", 500); return }
defer rows.Close()

var list []CountryCount
for rows.Next() {
var c CountryCount
_ = rows.Scan(&c.Country, &c.Count)
list = append(list, c)
}
w.Header().Set("Content-Type", "application/json")
_ = json.NewEncoder(w).Encode(list)
}

func adminMessagesHandler(w http.ResponseWriter, r *http.Request) {
switch r.Method {
case http.MethodGet:
db, err := openDB()
if err != nil { http.Error(w, "db", 500); return }
defer db.Close()
rows, err := db.Query(`SELECT id,title,content,type,is_active,created_at FROM admin_messages WHERE is_active=1 ORDER BY created_at DESC`)
if err != nil { http.Error(w, "query", 500); return }
defer rows.Close()
var out []AdminMessage
for rows.Next() {
var m AdminMessage
var active int
_ = rows.Scan(&m.ID,&m.Title,&m.Content,&m.Type,&active,&m.CreatedAt)
m.IsActive = (active==1)
out = append(out, m)
}
w.Header().Set("Content-Type", "application/json")
_ = json.NewEncoder(w).Encode(out)
case http.MethodPost:
var in AdminMessage
if err := json.NewDecoder(r.Body).Decode(&in); err != nil { http.Error(w, "bad json", 400); return }
in.Title = strings.TrimSpace(in.Title)
in.Content = strings.TrimSpace(in.Content)
if in.Content == "" { http.Error(w, "content required", 400); return }
if in.Type == "" { in.Type = "info" }

db, err := openDB()
if err != nil { http.Error(w, "db", 500); return }
defer db.Close()
in.ID = time.Now().Format("20060102150405")
in.CreatedAt = time.Now()
_, err = db.Exec(`INSERT INTO admin_messages (id,title,content,type,is_active,created_at) VALUES (?,?,?,?,1,?)`,
in.ID, in.Title, in.Content, in.Type, in.CreatedAt)
if err != nil { http.Error(w, "insert", 500); return }
w.Header().Set("Content-Type", "application/json")
_ = json.NewEncoder(w).Encode(map[string]string{"status":"ok","id":in.ID})
default:
http.Error(w, "method", 405)
}
}

func deactivateMessageHandler(w http.ResponseWriter, r *http.Request) {
if r.Method != http.MethodPost { http.Error(w, "method", 405); return }
var body struct{ ID string `json:"id"` }
if err := json.NewDecoder(r.Body).Decode(&body); err != nil || strings.TrimSpace(body.ID)=="" {
http.Error(w, "bad json", 400); return
}
db, err := openDB()
if err != nil { http.Error(w, "db", 500); return }
defer db.Close()
_, err = db.Exec(`UPDATE admin_messages SET is_active=0 WHERE id=?`, body.ID)
if err != nil { http.Error(w, "update", 500); return }
w.Header().Set("Content-Type", "application/json")
_ = json.NewEncoder(w).Encode(map[string]string{"status":"ok"})
}

func contactHandler(w http.ResponseWriter, r *http.Request) {
if r.Method != http.MethodPost { http.Error(w, "method", 405); return }
var in struct {
Name    string `json:"name"`
Email   string `json:"email"`
Message string `json:"message"`
Page    string `json:"page"`
}
if err := json.NewDecoder(r.Body).Decode(&in); err != nil { http.Error(w, "bad json", 400); return }
ip := r.Header.Get("X-Real-IP")
if ip=="" { ip = strings.Split(r.RemoteAddr, ":")[0] }

db, err := openDB()
if err != nil { http.Error(w, "db", 500); return }
defer db.Close()
_, err = db.Exec(`INSERT INTO contact_messages (name,email,message,page,ip_address) VALUES (?,?,?,?,?)`,
strings.TrimSpace(in.Name), strings.TrimSpace(in.Email), strings.TrimSpace(in.Message), strings.TrimSpace(in.Page), ip)
if err != nil { http.Error(w, "insert", 500); return }
w.Header().Set("Content-Type", "application/json")
_ = json.NewEncoder(w).Encode(map[string]string{"status":"ok"})
}

func heartbeatHandler(w http.ResponseWriter, r *http.Request) {
if r.Method != http.MethodPost { http.Error(w, "method", 405); return }
var in struct {
Duration int    `json:"duration"`
Page     string `json:"page"`
}
_ = json.NewDecoder(r.Body).Decode(&in)
// Aceita e retorna OK (opcional: atualizar visitor_logs)
w.Header().Set("Content-Type", "application/json")
_ = json.NewEncoder(w).Encode(map[string]string{"status":"ok"})
}

func main() {
createTables()

http.HandleFunc("/api/admin/stats", adminStatsHandler)
http.HandleFunc("/api/admin/visitors", adminVisitorsHandler)
http.HandleFunc("/api/admin/visitors/by-ip", visitorsByIPHandler)
http.HandleFunc("/api/admin/top-countries", topCountriesHandler)

http.HandleFunc("/api/admin/messages", adminMessagesHandler)
http.HandleFunc("/api/admin/messages/deactivate", deactivateMessageHandler)

http.HandleFunc("/api/admin/contact", contactHandler)
http.HandleFunc("/api/admin/heartbeat", heartbeatHandler)

log.Println("Admin API Server starting on :43212")
http.HandleFunc("/api/admin/sse", sseHandler)
	http.HandleFunc("/api/admin/stats/daily", dailyStatsHandler)
	http.HandleFunc("/api/admin/top-pages", topPagesHandler)
	http.HandleFunc("/api/admin/top-visitors", topVisitorsHandler)
	http.HandleFunc("/api/admin/contacts", contactsListHandler)
	log.Fatal(http.ListenAndServe(":43212", nil))
}
