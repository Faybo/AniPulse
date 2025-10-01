package handlers

import (
	"net/http"
	"os"
	"strings"
	"time"

	"seanime/internal/constants"

	"github.com/labstack/echo/v4"
)

type adminStatsDTO struct {
	TotalVisitors  int `json:"totalVisitors"`
	UniqueVisitors int `json:"uniqueVisitors"`
	PageViews      int `json:"pageViews"`
	AvgSession     int `json:"avgSession"`
}

func (h *Handler) HandleAdminStats(c echo.Context) error {
	if !isIPAllowedEcho(c.RealIP()) {
		return c.NoContent(http.StatusNotFound)
	}

	db := h.App.Database.Gorm()
	var s adminStatsDTO
	// Unique visitors by IP
	db.Raw("SELECT COUNT(DISTINCT ip_address) FROM visitor_logs").Scan(&s.UniqueVisitors)
	// Page views (all rows)
	db.Raw("SELECT COUNT(*) FROM visitor_logs").Scan(&s.PageViews)
	// Total visitors ~ unique visitors
	s.TotalVisitors = s.UniqueVisitors
	// Avg session (seconds)
	db.Raw("SELECT COALESCE(AVG(session_duration),0) FROM visitor_logs").Scan(&s.AvgSession)
	return c.JSON(http.StatusOK, s)
}

type topVisitorDTO struct {
	IP          string `json:"ip"`
	Count       int    `json:"count"`
	Country     string `json:"country"`
	CountryCode string `json:"country_code"`
}

func (h *Handler) HandleAdminTopVisitors(c echo.Context) error {
	if !isIPAllowedEcho(c.RealIP()) {
		return c.NoContent(http.StatusNotFound)
	}
	db := h.App.Database.Gorm()
	var out []topVisitorDTO
	db.Raw(`
        SELECT v.ip_address AS ip,
               COUNT(*) AS count,
               COALESCE(NULLIF(MAX(v.country),''), '') AS country,
               '' AS country_code
        FROM visitor_logs v
        GROUP BY v.ip_address
        ORDER BY count DESC
        LIMIT 50
    `).Scan(&out)
	return c.JSON(http.StatusOK, out)
}

type topCountryDTO struct {
	Country     string `json:"country"`
	CountryCode string `json:"country_code"`
	Count       int    `json:"count"`
}

func (h *Handler) HandleAdminTopCountries(c echo.Context) error {
	if !isIPAllowedEcho(c.RealIP()) {
		return c.NoContent(http.StatusNotFound)
	}
	db := h.App.Database.Gorm()
	var out []topCountryDTO
	db.Raw(`
        SELECT COALESCE(NULLIF(country,''),'Unknown') AS country,
               '' AS country_code,
               COUNT(*) AS count
        FROM visitor_logs
        GROUP BY country
        ORDER BY count DESC
        LIMIT 50
    `).Scan(&out)
	return c.JSON(http.StatusOK, out)
}

type visitorLogDTO struct {
	IPAddress       string    `json:"ip_address"`
	UserAgent       string    `json:"user_agent"`
	PageVisited     string    `json:"page_visited"`
	VisitTime       time.Time `json:"visit_time"`
	SessionDuration int       `json:"session_duration"`
	Country         string    `json:"country"`
	City            string    `json:"city"`
	Referrer        string    `json:"referrer"`
}

func (h *Handler) HandleAdminVisitorsByIP(c echo.Context) error {
	if !isIPAllowedEcho(c.RealIP()) {
		return c.NoContent(http.StatusNotFound)
	}
	ip := strings.TrimSpace(c.QueryParam("ip"))
	if ip == "" {
		return c.String(http.StatusBadRequest, "ip required")
	}
	db := h.App.Database.Gorm()
	var list []visitorLogDTO
	db.Raw(`
        SELECT ip_address,user_agent,page_visited,visit_time,session_duration,country,city,referrer
        FROM visitor_logs
        WHERE ip_address = ?
        ORDER BY visit_time DESC
        LIMIT 200
    `, ip).Scan(&list)

	// Simple metadata
	var total int
	db.Raw("SELECT COUNT(*) FROM visitor_logs WHERE ip_address = ?", ip).Scan(&total)
	var last string
	db.Raw("SELECT MAX(visit_time) FROM visitor_logs WHERE ip_address = ?", ip).Scan(&last)
	active := false
	if last != "" {
		if t, err := time.Parse("2006-01-02 15:04:05", last); err == nil {
			if time.Since(t) <= 5*time.Minute {
				active = true
			}
		}
	}

	return c.JSON(http.StatusOK, map[string]any{
		"ip":        ip,
		"total":     total,
		"last_seen": last,
		"active":    active,
		"visitors":  list,
	})
}

// Public analytics endpoint to track page views from the frontend in dev/prod
// Not IP restricted. The Echo pre-middleware already logs when pages are
// served by the backend. This endpoint ensures tracking also when the UI is
// served by Next.js dev server (43210).
type trackVisitBody struct {
	Page     string `json:"page"`
	Referrer string `json:"referrer"`
}

func (h *Handler) HandleTrackVisit(c echo.Context) error {
	var b trackVisitBody
	_ = c.Bind(&b)

	page := strings.TrimSpace(b.Page)
	if page == "" {
		page = c.Request().URL.Path
	}
	ref := strings.TrimSpace(b.Referrer)
	ua := c.Request().UserAgent()
	ip := c.RealIP()

	db := h.App.Database.Gorm()
	_ = db.Exec(`INSERT INTO visitor_logs (ip_address, user_agent, page_visited, referrer) VALUES (?,?,?,?)`, ip, ua, page, ref).Error
	return c.NoContent(http.StatusNoContent)
}

// allow localhost or ADMIN_ALLOWED_IPS
func isIPAllowedEcho(ip string) bool {
	if ip == "127.0.0.1" || ip == "::1" || ip == "" {
		return true
	}
	// 1) Env override
	if env := strings.TrimSpace(os.Getenv("ADMIN_ALLOWED_IPS")); env != "" {
		for _, s := range strings.Split(env, ",") {
			if ip == strings.TrimSpace(s) {
				return true
			}
		}
		return false
	}
	// 2) Fallback to constants.AdminAllowedIPs
	for _, s := range constants.AdminAllowedIPs {
		if ip == strings.TrimSpace(s) {
			return true
		}
	}
	return false
}
