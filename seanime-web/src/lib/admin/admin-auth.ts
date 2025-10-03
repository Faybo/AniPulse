"use client"

import React from "react"

/**
 * Sistema de autenticação admin baseado em código
 * Não depende de IP, usa localStorage
 */

interface AdminData {
    code: string
    timestamp: number
    expiresAt: number
    type: 'admin' | 'no-ads' | 'premium'
    features: string[]
}

const ADMIN_CODE_KEY = "anipulse_admin_code"

// Chave para armazenar dados do usuário atual
const USER_ID_KEY = "anipulse_user_id"
const USER_DATA_PREFIX = "anipulse_user_data_"

// Códigos por categoria
const ADMIN_CODES = [
    "ANIPULSE-ADMIN-2025",
    "MASTER-ANIPULSE-KEY",
    "ANI-ADMIN-2025-SECURE",
    "PULSE-MASTER-ADMIN",
    "ANIME-PULSE-ADMIN-2025",
    "ADMIN-SECURE-2025-ANIPULSE",
    "MASTER-ADMIN-ANIME-PULSE",
    "ANIPULSE-2025-ADMIN-KEY",
]

const NO_ADS_CODES = [
    "NO-ADS-2025",
    "ADFREE-ANIPULSE",
    "PREMIUM-NOADS",
    "WATCH-ADFREE",
]

const PREMIUM_CODES = [
    "PREMIUM-ANIPULSE-2025",
    "ULTRA-PREMIUM",
    "GOLD-MEMBERSHIP",
]

// Todos os códigos válidos
const VALID_CODES = [...ADMIN_CODES, ...NO_ADS_CODES, ...PREMIUM_CODES]

// Função para gerar ID único do usuário baseado em fingerprint
function generateUserId(): string {
    // Usar uma combinação de propriedades do navegador para gerar ID único
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (ctx) {
        ctx.textBaseline = 'top'
        ctx.font = '14px Arial'
        ctx.fillText('User fingerprint', 2, 2)
    }

    const fingerprint = [
        navigator.userAgent,
        navigator.language,
        screen.width + 'x' + screen.height,
        new Date().getTimezoneOffset(),
        canvas?.toDataURL() || 'no-canvas'
    ].join('|')

    // Gerar hash simples
    let hash = 0
    for (let i = 0; i < fingerprint.length; i++) {
        const char = fingerprint.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // Convert to 32-bit integer
    }

    return Math.abs(hash).toString(36)
}

// Função para obter ou criar ID do usuário atual
function getCurrentUserId(): string {
    if (typeof window === "undefined") return 'default'

    let userId = localStorage.getItem(USER_ID_KEY)
    if (!userId) {
        userId = generateUserId()
        localStorage.setItem(USER_ID_KEY, userId)
    }
    return userId
}

// Função para obter chave específica do usuário
function getUserKey(key: string): string {
    const userId = getCurrentUserId()
    return `${USER_DATA_PREFIX}${userId}_${key}`
}

// Função para determinar o tipo de código
function getCodeType(code: string): { type: 'admin' | 'no-ads' | 'premium', features: string[] } {
    const upperCode = code.toUpperCase()

    if (ADMIN_CODES.includes(upperCode)) {
        return { type: 'admin', features: ['admin', 'no-ads', 'premium'] }
    }

    if (NO_ADS_CODES.includes(upperCode)) {
        return { type: 'no-ads', features: ['no-ads'] }
    }

    if (PREMIUM_CODES.includes(upperCode)) {
        return { type: 'premium', features: ['no-ads', 'premium'] }
    }

    return { type: 'no-ads', features: [] } // fallback
}

/**
 * Verificar se o usuário tem código admin válido e não expirado
 */
export function isAdmin(): boolean {
    if (typeof window === "undefined") return false

    try {
        const userKey = getUserKey(ADMIN_CODE_KEY)
        const savedData = localStorage.getItem(userKey)
        if (!savedData) return false

        const adminData = JSON.parse(savedData) as AdminData

        // Verificar se expirou (24 horas)
        if (Date.now() > adminData.expiresAt) {
            localStorage.removeItem(userKey)
            return false
        }

        return adminData.features.includes('admin')
    } catch (error) {
        console.error("Erro ao verificar código admin:", error)
        // Limpar dados corrompidos
        const userKey = getUserKey(ADMIN_CODE_KEY)
        localStorage.removeItem(userKey)
        return false
    }
}

/**
 * Salvar código admin com validação extra
 */
export function setAdminCode(code: string): boolean {
    if (typeof window === "undefined") return false

    const trimmedCode = code.trim().toUpperCase()

    // Validação adicional: código deve ter pelo menos 15 caracteres
    if (trimmedCode.length < 15) {
        return false
    }

    // Verificar se contém padrões básicos de segurança
    const hasLetters = /[A-Z]/.test(trimmedCode)
    const hasNumbers = /\d/.test(trimmedCode)
    const hasDashes = /-/.test(trimmedCode)

    if (!hasLetters || !hasNumbers || !hasDashes) {
        return false
    }

    if (VALID_CODES.includes(trimmedCode)) {
        try {
            const codeInfo = getCodeType(trimmedCode)

            // Salvar com timestamp para expiração
            const adminData: AdminData = {
                code: trimmedCode,
                timestamp: Date.now(),
                expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 horas
                type: codeInfo.type,
                features: codeInfo.features
            }

            const userKey = getUserKey(ADMIN_CODE_KEY)
            localStorage.setItem(userKey, JSON.stringify(adminData))

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
        const userKey = getUserKey(ADMIN_CODE_KEY)
        localStorage.removeItem(userKey)
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
        const userKey = getUserKey(ADMIN_CODE_KEY)
        return localStorage.getItem(userKey)
    } catch (error) {
        return null
    }
}

/**
 * Verificar se um código é válido (sem salvar)
 */
export function isValidAdminCode(code: string): boolean {
    const trimmedCode = code.trim().toUpperCase()
    return VALID_CODES.includes(trimmedCode)
}

/**
 * Verificar se usuário tem acesso no-ads
 */
export function hasNoAdsAccess(): boolean {
    if (typeof window === "undefined") return false

    try {
        const userKey = getUserKey(ADMIN_CODE_KEY)
        const savedData = localStorage.getItem(userKey)
        if (!savedData) return false

        const adminData = JSON.parse(savedData) as AdminData

        // Verificar se expirou
        if (Date.now() > adminData.expiresAt) {
            localStorage.removeItem(userKey)
            return false
        }

        return adminData.features.includes('no-ads')
    } catch (error) {
        return false
    }
}

/**
 * Verificar se usuário tem acesso premium
 */
export function hasPremiumAccess(): boolean {
    if (typeof window === "undefined") return false

    try {
        const userKey = getUserKey(ADMIN_CODE_KEY)
        const savedData = localStorage.getItem(userKey)
        if (!savedData) return false

        const adminData = JSON.parse(savedData) as AdminData

        // Verificar se expirou
        if (Date.now() > adminData.expiresAt) {
            localStorage.removeItem(userKey)
            return false
        }

        return adminData.features.includes('premium')
    } catch (error) {
        return false
    }
}

/**
 * Obter informações sobre o código ativo
 */
export function getActiveCodeInfo(): AdminData | null {
    if (typeof window === "undefined") return null

    try {
        const userKey = getUserKey(ADMIN_CODE_KEY)
        const savedData = localStorage.getItem(userKey)
        if (!savedData) return null

        const adminData = JSON.parse(savedData) as AdminData

        // Verificar se expirou
        if (Date.now() > adminData.expiresAt) {
            localStorage.removeItem(userKey)
            return null
        }

        return adminData
    } catch (error) {
        return null
    }
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


