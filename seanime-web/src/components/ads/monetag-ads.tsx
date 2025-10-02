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
 * Quando clicado, mostra um interstitial e depois desativa os ads por 1 hora
 */
export function MonetagAdFreeButton() {
    const { grantAdFree, isAdFree, remainingAdFreeMs } = useAdManager()
    const [isWatchingAd, setIsWatchingAd] = useState(false)
    const [countdown, setCountdown] = useState(30) // 30 segundos

    const handleClick = () => {
        // Iniciar processo de "assistir ad"
        setIsWatchingAd(true)
        setCountdown(30)
        
        // Abrir um novo pop-under do Monetag (simula ad rewarded)
        try {
            // Força um clique para triggerar o Monetag
            const dummyLink = document.createElement('a')
            dummyLink.href = 'https://newnarutoragnarok.site'
            dummyLink.target = '_blank'
            document.body.appendChild(dummyLink)
            dummyLink.click()
            document.body.removeChild(dummyLink)
        } catch {}
        
        // Countdown de 30 segundos
        const interval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval)
                    setIsWatchingAd(false)
                    grantAdFree(60) // 60 minutos
                    
                    // Tracking
                    try {
                        // @ts-ignore
                        window?.gtag?.("event", "ad_free_granted", { method: "rewarded" })
                        // @ts-ignore
                        window?.umami?.track?.("ad_free_granted")
                    } catch {}
                    
                    return 0
                }
                return prev - 1
            })
        }, 1000)
    }

    // Se está assistindo o ad, mostra o countdown
    if (isWatchingAd) {
        return (
            <button
                className="px-3 py-1 bg-yellow-500 text-white rounded text-xs font-medium disabled:opacity-75 animate-pulse"
                disabled
            >
                ⏳ Aguarde {countdown}s...
            </button>
        )
    }

    // Se já está em ad-free, mostra o tempo restante
    if (isAdFree()) {
        const minutes = Math.floor(remainingAdFreeMs / 60000)
        const seconds = Math.floor((remainingAdFreeMs % 60000) / 1000)
        
        return (
            <button
                className="px-3 py-1 bg-green-500 text-white rounded text-xs font-medium disabled:opacity-75"
                disabled
            >
                ✓ Ad-free: {minutes}:{seconds.toString().padStart(2, "0")}
            </button>
        )
    }

    return (
        <button
            onClick={handleClick}
            className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded text-xs font-medium hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg whitespace-nowrap"
        >
            🎁 Get 1h Ad-free
        </button>
    )
}

