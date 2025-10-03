"use client"

import React, { useState } from "react"
import { isAdmin, setAdminCode, removeAdminCode, isValidAdminCode, hasNoAdsAccess, hasPremiumAccess, getActiveCodeInfo } from "@/lib/admin/admin-auth"

/**
 * Componente para inserir código admin
 */
export function AdminCodeInput() {
    const [code, setCode] = useState("")
    const [isAdminUser, setIsAdminUser] = useState(isAdmin())
    const [showInput, setShowInput] = useState(false)
    const [error, setError] = useState("")
    const [activeCodeInfo, setActiveCodeInfo] = useState(getActiveCodeInfo())

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (!code.trim()) {
            setError("Digite um código")
            return
        }

        const success = setAdminCode(code)

        if (success) {
            setIsAdminUser(isAdmin())
            setActiveCodeInfo(getActiveCodeInfo())
            setShowInput(false)
            setCode("")
            setError("")
            // Recarregar página para aplicar mudanças
            window.location.reload()
        } else {
            setError("Código inválido!")
            setCode("")
        }
    }

    const handleLogout = () => {
        removeAdminCode()
        setIsAdminUser(false)
        setActiveCodeInfo(null)
        // Recarregar página
        window.location.reload()
    }

    if (isAdminUser) {
        const features = activeCodeInfo?.features || []
        const hasNoAds = hasNoAdsAccess()
        const hasPremium = hasPremiumAccess()

        return (
            <div className="flex items-center gap-2">
                <span className="text-xs px-2 py-1 bg-green-500 text-white rounded font-medium animate-pulse">
                    ✓ ADMIN
                </span>
                {hasNoAds && (
                    <span className="text-xs px-2 py-1 bg-blue-500 text-white rounded font-medium">
                        NO ADS
                    </span>
                )}
                {hasPremium && (
                    <span className="text-xs px-2 py-1 bg-purple-500 text-white rounded font-medium">
                        PREMIUM
                    </span>
                )}
                <button
                    onClick={handleLogout}
                    className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    title="Sair"
                >
                    ✕
                </button>
            </div>
        )
    }

    if (!showInput) {
        return (
            <button
                onClick={() => setShowInput(true)}
                className="text-xs px-3 py-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg font-medium"
                title="Inserir código especial"
            >
                🔑 Put Your Code
            </button>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Digite o código"
                className="text-xs px-2 py-1 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 outline-none w-32"
                autoFocus
            />
            <button
                type="submit"
                className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
                ✓
            </button>
            <button
                type="button"
                onClick={() => {
                    setShowInput(false)
                    setCode("")
                    setError("")
                }}
                className="text-xs px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-500 transition-colors"
            >
                ✕
            </button>
            {error && (
                <span className="text-xs text-red-500">{error}</span>
            )}
        </form>
    )
}

/**
 * Componente compacto para TopNavbar
 */
export function AdminCodeBadge() {
    const [isAdminUser, setIsAdminUser] = useState(false)

    // Verificar status admin ao montar
    React.useEffect(() => {
        setIsAdminUser(isAdmin())
    }, [])

    if (!isAdminUser) return null

    return (
        <span className="text-xs px-2 py-1 bg-green-500 text-white rounded font-medium">
            ✓ Admin
        </span>
    )
}

