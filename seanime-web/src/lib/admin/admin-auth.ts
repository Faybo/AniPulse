"use client"

/**
 * Sistema de autenticação admin baseado em código
 * Não depende de IP, usa localStorage
 */

const ADMIN_CODE_KEY = "anipulse_admin_code"
const VALID_ADMIN_CODES = [
    "ADMIN-ANIPULSE-2025",
    "MASTER-KEY-XYZ",
    // Adicione mais códigos aqui conforme necessário
]

/**
 * Verificar se o usuário tem código admin válido
 */
export function isAdmin(): boolean {
    if (typeof window === "undefined") return false
    
    try {
        const savedCode = localStorage.getItem(ADMIN_CODE_KEY)
        if (!savedCode) return false
        
        return VALID_ADMIN_CODES.includes(savedCode)
    } catch (error) {
        console.error("Erro ao verificar código admin:", error)
        return false
    }
}

/**
 * Salvar código admin
 */
export function setAdminCode(code: string): boolean {
    if (typeof window === "undefined") return false
    
    const trimmedCode = code.trim().toUpperCase()
    
    if (VALID_ADMIN_CODES.includes(trimmedCode)) {
        try {
            localStorage.setItem(ADMIN_CODE_KEY, trimmedCode)
            
            // Tracking opcional
            try {
                // @ts-ignore
                window?.gtag?.("event", "admin_code_activated")
                // @ts-ignore
                window?.umami?.track?.("admin_code_activated")
            } catch {}
            
            return true
        } catch (error) {
            console.error("Erro ao salvar código admin:", error)
            return false
        }
    }
    
    return false
}

/**
 * Remover código admin (logout)
 */
export function removeAdminCode(): void {
    if (typeof window === "undefined") return
    
    try {
        localStorage.removeItem(ADMIN_CODE_KEY)
    } catch (error) {
        console.error("Erro ao remover código admin:", error)
    }
}

/**
 * Obter código admin atual (para debug)
 */
export function getAdminCode(): string | null {
    if (typeof window === "undefined") return null
    
    try {
        return localStorage.getItem(ADMIN_CODE_KEY)
    } catch (error) {
        return null
    }
}

/**
 * Verificar se um código é válido (sem salvar)
 */
export function isValidAdminCode(code: string): boolean {
    const trimmedCode = code.trim().toUpperCase()
    return VALID_ADMIN_CODES.includes(trimmedCode)
}

/**
 * Hook React para verificar status admin
 */
export function useIsAdmin() {
    if (typeof window === "undefined") return false
    
    const [adminStatus, setAdminStatus] = React.useState(false)
    
    React.useEffect(() => {
        setAdminStatus(isAdmin())
        
        // Escutar mudanças no localStorage (para sincronizar entre tabs)
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === ADMIN_CODE_KEY) {
                setAdminStatus(isAdmin())
            }
        }
        
        window.addEventListener("storage", handleStorageChange)
        return () => window.removeEventListener("storage", handleStorageChange)
    }, [])
    
    return adminStatus
}

// Exportar para uso global se necessário
if (typeof window !== "undefined") {
    // @ts-ignore
    window.__isAdmin = isAdmin
}

// Importar React para o hook
import React from "react"

