package main

import (
	"database/sql"
	"embed"
	"encoding/json"
	"fmt"
	"html"
	"net/http"
	"os"
	"strings"
	"time"

	"seanime/internal/server"

	_ "github.com/mattn/go-sqlite3"
)

//go:embed all:web
var WebFS embed.FS

//go:embed internal/icon/logo.png
var embeddedLogo []byte

// Helpers

func sanitize(s string, max int) string {
	s = strings.TrimSpace(s)
	if len(s) > max {
		s = s[:max]
	}
	return html.EscapeString(s)
}

// Criar tabelas necessárias
func createAdminTables() {
	db, err := sql.Open("sqlite3", "./data-dev/seanime.db")
	if err != nil {
		fmt.Println("Erro ao abrir database:", err)
		return
	}
	defer db.Close()

	// Tabela de logs de visitantes
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS visitor_logs (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			ip_address TEXT,
			user_agent TEXT,
			page_visited TEXT,
			visit_time DATETIME DEFAULT CURRENT_TIMESTAMP,
			session_duration INTEGER DEFAULT 0,
			country TEXT,
            country_code TEXT,
			city TEXT,
			referrer TEXT
		)
	`)
	if err != nil {
		fmt.Println("Erro ao criar tabela visitor_logs:", err)
	}

	// Garantir colunas novas (ignorar erros se já existirem)
	_, _ = db.Exec(`ALTER TABLE visitor_logs ADD COLUMN country_code TEXT`)

	// Tabela de mensagens admin
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS admin_messages (
			id TEXT PRIMARY KEY,
			title TEXT,
			content TEXT,
			type TEXT DEFAULT 'info',
			is_active INTEGER DEFAULT 1,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)
	`)
	if err != nil {
		fmt.Println("Erro ao criar tabela admin_messages:", err)
	}

	// Cache de geolocalização por IP
	_, err = db.Exec(`
        CREATE TABLE IF NOT EXISTS ip_geo (
            ip TEXT PRIMARY KEY,
            country TEXT,
            country_code TEXT,
            city TEXT,
            last_updated DATETIME
        )
    `)
	if err != nil {
		fmt.Println("Erro ao criar tabela ip_geo:", err)
	}

	// Tabela de mensagens de contato
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS contact_messages (
			id TEXT PRIMARY KEY,
			name TEXT,
			email TEXT,
			subject TEXT,
			message TEXT,
			is_read INTEGER DEFAULT 0,
			created_at DATETIME DEFAULT CURRENT_TIMESTAMP
		)
	`)
	if err != nil {
		fmt.Println("Erro ao criar tabela contact_messages:", err)
	}
}

// Middleware para tracking automático de visitantes
func visitorTrackingMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// Log do visitante (apenas para páginas principais)
		if !strings.Contains(r.URL.Path, "/api/") && !strings.Contains(r.URL.Path, "/_next/") {
			go logVisitor(r)
		}
		next(w, r)
	}
}

func logVisitor(r *http.Request) {
	db, err := sql.Open("sqlite3", "./data-dev/seanime.db")
	if err != nil {
		return
	}
	defer db.Close()

	ip := getClientIP(r)
	userAgent := r.Header.Get("User-Agent")
	page := r.URL.Path
	referrer := r.Header.Get("Referer")

	// Geo (com cache)
	country, countryCode, city := getGeoForIP(ip)

	_, err = db.Exec(`
        INSERT INTO visitor_logs (ip_address, user_agent, page_visited, referrer, country, country_code, city) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `, ip, userAgent, page, referrer, country, countryCode, city)

	if err != nil {
		fmt.Println("Erro ao inserir visitor log:", err)
	}
}

func getClientIP(r *http.Request) string {
	ip := r.Header.Get("X-Forwarded-For")
	if ip == "" {
		ip = r.Header.Get("X-Real-IP")
	}
	if ip == "" {
		ip = r.RemoteAddr
	}
	if strings.Contains(ip, ":") {
		ip = strings.Split(ip, ":")[0]
	}
	return ip
}

// API para estatísticas admin

// Setup das rotas admin
func setupAdminRoutes() {
	// Desativado: as tabelas e rotas admin são geridas pelo Echo (internal/handlers)
	// createAdminTables()

	// Desativado: estas rotas existem no Echo (ver internal/handlers/routes.go)
	// http.HandleFunc("/api/admin/stats", ipAllowlist(adminStatsHandler))
	// http.HandleFunc("/api/admin/visitors", ipAllowlist(adminVisitorsHandler))
	// http.HandleFunc("/api/admin/messages", ipAllowlist(adminMessagesHandler))
	// http.HandleFunc("/api/admin/visitors/by-ip", ipAllowlist(visitorsByIPHandler))
	// http.HandleFunc("/api/admin/top-visitors", ipAllowlist(topVisitorsHandler))
	// http.HandleFunc("/api/admin/top-countries", ipAllowlist(topCountriesHandler))

	// Página /admin servida pelo Echo (internal/core/echo.go)
	// http.HandleFunc("/admin", adminPageHandler)

	fmt.Println("Admin routes configured successfully")
}

func main() {
	// Setup admin routes ANTES de iniciar o servidor
	setupAdminRoutes()

	// Iniciar servidor principal
	server.StartServer(WebFS, embeddedLogo)
}

// --- Geo helpers & extra handlers ---

type ipGeoResp struct {
	Status      string `json:"status"`
	Country     string `json:"country"`
	CountryCode string `json:"countryCode"`
	City        string `json:"city"`
}

func getGeoForIP(ip string) (string, string, string) {
	if strings.TrimSpace(ip) == "" {
		return "", "", ""
	}
	db, err := sql.Open("sqlite3", "./data-dev/seanime.db")
	if err != nil {
		return "", "", ""
	}
	defer db.Close()

	var c, cc, ci string
	_ = db.QueryRow("SELECT country, country_code, city FROM ip_geo WHERE ip = ?", ip).Scan(&c, &cc, &ci)
	if c != "" || cc != "" || ci != "" {
		return c, cc, ci
	}

	client := &http.Client{Timeout: 2 * time.Second}
	resp, err := client.Get("http://ip-api.com/json/" + ip + "?fields=status,country,countryCode,city")
	if err == nil && resp != nil && resp.Body != nil {
		defer resp.Body.Close()
		var d ipGeoResp
		_ = json.NewDecoder(resp.Body).Decode(&d)
		if strings.ToLower(d.Status) == "success" {
			c = d.Country
			cc = d.CountryCode
			ci = d.City
			_, _ = db.Exec("INSERT OR REPLACE INTO ip_geo (ip, country, country_code, city, last_updated) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)", ip, c, cc, ci)
		}
	}
	return c, cc, ci
}

// --- IP allowlist ---
func isAdminIPAllowed(r *http.Request) bool {
	ip := getClientIP(r)
	if ip == "127.0.0.1" || ip == "::1" {
		return true
	}
	allowed := os.Getenv("ADMIN_ALLOWED_IPS")
	if strings.TrimSpace(allowed) == "" {
		return false
	}
	for _, s := range strings.Split(allowed, ",") {
		if ip == strings.TrimSpace(s) {
			return true
		}
	}
	return false
}

func ipAllowlist(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if !isAdminIPAllowed(r) {
			http.NotFound(w, r)
			return
		}
		next(w, r)
	}
}

func adminPageHandler(w http.ResponseWriter, r *http.Request) {
	if !isAdminIPAllowed(r) {
		http.NotFound(w, r)
		return
	}
	b, err := WebFS.ReadFile("web/admin.html")
	if err != nil {
		http.NotFound(w, r)
		return
	}
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	_, _ = w.Write(b)
}
