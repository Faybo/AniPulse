"use client"

import { useAdManager } from "@/components/ads/ad-manager"
import Script from "next/script"
import { useEffect, useState } from "react"

/**
 * Componente Monetag Multitag
 * Integrado com o sistema ad-free
 */
export function MonetagMultitag() {
    const { isAdFree } = useAdManager()
    const [shouldLoad, setShouldLoad] = useState(false)

    useEffect(() => {
        // Só carrega o script se NÃO estiver em modo ad-free
        setShouldLoad(!isAdFree())
    }, [isAdFree])

    // Se estiver em modo ad-free, não renderiza nada
    if (!shouldLoad) {
        return null
    }

    return (
        <Script
            src="https://fpyf8.com/88/tag.min.js"
            data-zone="175417"
            async
            data-cfasync="false"
            strategy="afterInteractive"
        />
    )
}

/**
 * Componente para o botão "Get 1h Ad-free"
 * Quando clicado, desativa os ads por 1 hora
 */
export function MonetagAdFreeButton() {
    const { grantAdFree, isAdFree, remainingAdFreeMs } = useAdManager()

    const handleClick = () => {
        // Aqui você pode adicionar lógica para mostrar um video ad rewarded
        // Por enquanto, vamos apenas conceder ad-free direto
        grantAdFree(60) // 60 minutos
        
        // Tracking opcional
        try {
            // @ts-ignore
            window?.gtag?.("event", "ad_free_button_clicked")
            // @ts-ignore
            window?.umami?.track?.("ad_free_button_clicked")
        } catch {}
    }

    // Se já está em ad-free, mostra o tempo restante
    if (isAdFree()) {
        const minutes = Math.floor(remainingAdFreeMs / 60000)
        const seconds = Math.floor((remainingAdFreeMs % 60000) / 1000)
        
        return (
            <button
                className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium disabled:opacity-50"
                disabled
            >
                ✓ Ad-free: {minutes}:{seconds.toString().padStart(2, "0")}
            </button>
        )
    }

    return (
        <button
            onClick={handleClick}
            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg"
        >
            🎁 Get 1h Ad-free
        </button>
    )
}

