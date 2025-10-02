"use client"

import React, { useState } from "react"
import { isAdmin, setAdminCode, removeAdminCode, isValidAdminCode } from "@/lib/admin/admin-auth"

/**
 * Componente para inserir código admin
 */
export function AdminCodeInput() {
    const [code, setCode] = useState("")
    const [isAdminUser, setIsAdminUser] = useState(isAdmin())
    const [showInput, setShowInput] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (!code.trim()) {
            setError("Digite um código")
            return
        }

        const success = setAdminCode(code)
        
        if (success) {
            setIsAdminUser(true)
            setShowInput(false)
            setCode("")
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
        // Recarregar página
        window.location.reload()
    }

    if (isAdminUser) {
        return (
            <div className="flex items-center gap-2">
                <span className="text-xs text-green-500 font-medium">✓ Admin</span>
                <button
                    onClick={handleLogout}
                    className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    title="Sair do modo admin"
                >
                    Logout Admin
                </button>
            </div>
        )
    }

    if (!showInput) {
        return (
            <button
                onClick={() => setShowInput(true)}
                className="text-xs px-2 py-1 bg-gray-700 text-white rounded hover:bg-gray-600 transition-colors"
                title="Inserir código admin"
            >
                🔑 Admin Code
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

