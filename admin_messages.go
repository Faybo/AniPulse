package main

import (
    "database/sql"
    "encoding/json"
    "net/http"
    "time"
    _ "github.com/mattn/go-sqlite3"
)

type AdminMessage struct {
    ID        string    `json:"id"`
    Title     string    `json:"title"`
    Content   string    `json:"content"`
    Type      string    `json:"type"` // info, warning, error, success
    IsActive  bool      `json:"isActive"`
    CreatedAt time.Time `json:"createdAt"`
}

// Criar tabela de mensagens admin
func createAdminMessagesTable() {
    db, err := sql.Open("sqlite3", "./data-dev/seanime.db")
    if err != nil {
        return
    }
    defer db.Close()

    db.Exec(`
        CREATE TABLE IF NOT EXISTS admin_messages (
            id TEXT PRIMARY KEY,
            title TEXT,
            content TEXT,
            type TEXT DEFAULT 'info',
            is_active INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `)
}

// API para obter mensagens ativas
func adminMessagesHandler(w http.ResponseWriter, r *http.Request) {
    db, err := sql.Open("sqlite3", "./data-dev/seanime.db")
    if err != nil {
        http.Error(w, "Database error", 500)
        return
    }
    defer db.Close()

    rows, err := db.Query("SELECT id, title, content, type, is_active, created_at FROM admin_messages WHERE is_active = 1 ORDER BY created_at DESC")
    if err != nil {
        http.Error(w, "Query error", 500)
        return
    }
    defer rows.Close()

    var messages []AdminMessage
    for rows.Next() {
        var msg AdminMessage
        var isActive int
        rows.Scan(&msg.ID, &msg.Title, &msg.Content, &msg.Type, &isActive, &msg.CreatedAt)
        msg.IsActive = isActive == 1
        messages = append(messages, msg)
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(messages)
}

// API para criar nova mensagem
func createAdminMessageHandler(w http.ResponseWriter, r *http.Request) {
    if r.Method != "POST" {
        http.Error(w, "Method not allowed", 405)
        return
    }

    var msg AdminMessage
    if err := json.NewDecoder(r.Body).Decode(&msg); err != nil {
        http.Error(w, "Invalid JSON", 400)
        return
    }

    db, err := sql.Open("sqlite3", "./data-dev/seanime.db")
    if err != nil {
        http.Error(w, "Database error", 500)
        return
    }
    defer db.Close()

    msg.ID = time.Now().Format("20060102150405")
    msg.CreatedAt = time.Now()

    _, err = db.Exec(`
        INSERT INTO admin_messages (id, title, content, type, is_active, created_at) 
        VALUES (?, ?, ?, ?, ?, ?)
    `, msg.ID, msg.Title, msg.Content, msg.Type, 1, msg.CreatedAt)

    if err != nil {
        http.Error(w, "Insert error", 500)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(map[string]string{"status": "success", "id": msg.ID})
}
