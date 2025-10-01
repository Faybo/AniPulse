package main

import (
    "net/http"
    "strings"
)

// Middleware para corrigir AniList OAuth redirect
func fixAnilistOAuthMiddleware(next http.HandlerFunc) http.HandlerFunc {
    return func(w http.ResponseWriter, r *http.Request) {
        // Se for request do AniList OAuth, corrigir URL
        if strings.Contains(r.URL.Path, "/auth/callback") {
            // Redirecionar para domínio correto
            http.Redirect(w, r, "https://newnarutoragnarok.site/auth/callback"+r.URL.RawQuery, http.StatusTemporaryRedirect)
            return
        }
        next(w, r)
    }
}

// Handler para AniList OAuth callback
func anilistCallbackHandler(w http.ResponseWriter, r *http.Request) {
    // Processar token do AniList
    token := r.URL.Query().Get("access_token")
    if token != "" {
        // Redirecionar para página principal com token
        http.Redirect(w, r, "https://newnarutoragnarok.site/?token="+token, http.StatusTemporaryRedirect)
        return
    }
    
    // Se não há token, redirecionar para login
    http.Redirect(w, r, "https://newnarutoragnarok.site/", http.StatusTemporaryRedirect)
}
