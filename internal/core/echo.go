package core

import (
	"embed"
	"fmt"
	"io/fs"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"seanime/internal/constants"

	"github.com/goccy/go-json"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
)

func NewEchoApp(app *App, webFS *embed.FS) *echo.Echo {
	e := echo.New()
	e.HideBanner = true
	e.HidePort = true
	e.Debug = false
	e.JSONSerializer = &CustomJSONSerializer{}

	distFS, err := fs.Sub(webFS, "web")
	if err != nil {
		log.Fatal(err)
	}

	e.Use(middleware.StaticWithConfig(middleware.StaticConfig{
		Filesystem: http.FS(distFS),
		Browse:     true,
		HTML5:      true,
		Skipper: func(c echo.Context) bool {
			cUrl := c.Request().URL
			if strings.HasPrefix(cUrl.RequestURI(), "/api") ||
				strings.HasPrefix(cUrl.RequestURI(), "/events") ||
				strings.HasPrefix(cUrl.RequestURI(), "/assets") ||
				strings.HasPrefix(cUrl.RequestURI(), "/manga-downloads") ||
				strings.HasPrefix(cUrl.RequestURI(), "/offline-assets") {
				return true // Continue to the next handler
			}
			if !strings.HasSuffix(cUrl.Path, ".html") && filepath.Ext(cUrl.Path) == "" {
				cUrl.Path = cUrl.Path + ".html"
			}
			if cUrl.Path == "/.html" {
				cUrl.Path = "/index.html"
			}
			return false // Continue to the filesystem handler
		},
	}))

	// Ensure visitor_logs table exists (lightweight analytics)
	{
		_ = app.Database.Gorm().Exec(`
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
			)
		`).Error
	}

	// Protect /admin and /admin.html by IP allowlist; return 404 if unauthorized
	e.Pre(func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			p := c.Request().URL.Path
			if p == "/admin" || p == "/admin.html" {
				if !isIPAllowed(c.RealIP()) {
					return c.NoContent(http.StatusNotFound)
				}
			}
			return next(c)
		}
	})

	// Visitor tracking for non-API/non-static routes
	e.Pre(func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			u := c.Request().URL
			path := u.Path
			if strings.HasPrefix(path, "/api/") || strings.HasPrefix(path, "/events") || strings.HasPrefix(path, "/assets") || strings.HasPrefix(path, "/manga-downloads") || strings.HasPrefix(path, "/offline-assets") || strings.HasPrefix(path, "/_next") || path == "/favicon.ico" {
				return next(c)
			}
			// Insert log (fire and forget)
			go func(ip, ua, page, ref string) {
				err := app.Database.Gorm().Exec(`INSERT INTO visitor_logs (ip_address, user_agent, page_visited, referrer) VALUES (?,?,?,?)`, ip, ua, page, ref).Error
				if err != nil {
					_ = fmt.Errorf("visitor log insert: %w", err)
				}
			}(c.RealIP(), c.Request().UserAgent(), path, c.Request().Referer())
			return next(c)
		}
	})

	app.Logger.Info().Msgf("app: Serving embedded web interface")

	// Serve web assets
	app.Logger.Info().Msgf("app: Web assets path: %s", app.Config.Web.AssetDir)
	e.Static("/assets", app.Config.Web.AssetDir)

	// Serve manga downloads
	if app.Config.Manga.DownloadDir != "" {
		app.Logger.Info().Msgf("app: Manga downloads path: %s", app.Config.Manga.DownloadDir)
		e.Static("/manga-downloads", app.Config.Manga.DownloadDir)
	}

	// Serve offline assets
	app.Logger.Info().Msgf("app: Offline assets path: %s", app.Config.Offline.AssetDir)
	e.Static("/offline-assets", app.Config.Offline.AssetDir)

	return e
}

type CustomJSONSerializer struct{}

func (j *CustomJSONSerializer) Serialize(c echo.Context, i interface{}, indent string) error {
	enc := json.NewEncoder(c.Response())
	return enc.Encode(i)
}

func (j *CustomJSONSerializer) Deserialize(c echo.Context, i interface{}) error {
	dec := json.NewDecoder(c.Request().Body)
	return dec.Decode(i)
}

func RunEchoServer(app *App, e *echo.Echo) {
	app.Logger.Info().Msgf("app: Server Address: %s", app.Config.GetServerAddr())

	// Start the server
	go func() {
		log.Fatal(e.Start(app.Config.GetServerAddr()))
	}()

	time.Sleep(100 * time.Millisecond)
	app.Logger.Info().Msg("app: Seanime started at " + app.Config.GetServerURI())
}

// isIPAllowed checks if the incoming IP is allowed to access admin resources.
// Allows localhost by default and uses ADMIN_ALLOWED_IPS env (comma-separated)
// for additional IPs.
func isIPAllowed(ip string) bool {
	if ip == "127.0.0.1" || ip == "::1" || ip == "" {
		return true
	}
	// 1) Check env override
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
