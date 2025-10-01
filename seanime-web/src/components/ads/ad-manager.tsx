"use client"

import React, { createContext, useContext, useState, useEffect, useMemo } from "react"
import { AdBanner, NativeAd, VideoAd } from "./ad-banner"

interface AdConfig {
    enabled: boolean
    frequency: number // 1 = sempre, 2 = a cada 2 visualizações, etc.
    positions: {
        top: boolean
        bottom: boolean
        sidebar: boolean
        inline: boolean
    }
    types: {
        banner: boolean
        native: boolean
        video: boolean
    }
    networks: {
        google: boolean
        facebook: boolean
        custom: boolean
    }
}

interface AdManagerContextType {
    config: AdConfig
    updateConfig: (newConfig: Partial<AdConfig>) => void
    shouldShowAd: (position: string) => boolean
    incrementViewCount: () => void
    isAdFree: () => boolean
    grantAdFree: (minutes: number) => void
    remainingAdFreeMs: number
}

const AdManagerContext = createContext<AdManagerContextType | undefined>(undefined)

export function useAdManager() {
    const context = useContext(AdManagerContext)
    if (!context) {
        throw new Error("useAdManager must be used within AdManagerProvider")
    }
    return context
}

const defaultConfig: AdConfig = {
    enabled: true,
    frequency: 3, // Mostrar anúncio a cada 3 visualizações
    positions: {
        top: true,
        bottom: true,
        sidebar: true,
        inline: true
    },
    types: {
        banner: true,
        native: true,
        video: false
    },
    networks: {
        google: false,
        facebook: false,
        custom: true
    }
}

export function AdManagerProvider({ children }: { children: React.ReactNode }) {
    const [config, setConfig] = useState<AdConfig>(defaultConfig)
    const [viewCount, setViewCount] = useState(0)
    const [adFreeUntil, setAdFreeUntil] = useState<number | null>(null)
    const [remainingAdFreeMs, setRemainingAdFreeMs] = useState<number>(0)

    useEffect(() => {
        // Carregar configuração do localStorage
        const savedConfig = localStorage.getItem("ad-config")
        if (savedConfig) {
            try {
                const parsedConfig = JSON.parse(savedConfig) as AdConfig
                setConfig(parsedConfig)
            } catch (error) {
                console.error("Error loading ad config:", error)
            }
        }

        // Carregar contador de visualizações
        const savedViewCount = localStorage.getItem("ad-view-count")
        if (savedViewCount) {
            setViewCount(parseInt(savedViewCount))
        }

        // Carregar estado ad-free
        const savedAdFreeUntil = localStorage.getItem("ad-free-until")
        if (savedAdFreeUntil) {
            const ts = parseInt(savedAdFreeUntil)
            if (!Number.isNaN(ts)) {
                setAdFreeUntil(ts)
            }
        }
    }, [])

    const updateConfig = (newConfig: Partial<AdConfig>) => {
        const updatedConfig = { ...config, ...newConfig }
        setConfig(updatedConfig)
        localStorage.setItem("ad-config", JSON.stringify(updatedConfig))
    }

    const incrementViewCount = () => {
        const newCount = viewCount + 1
        setViewCount(newCount)
        localStorage.setItem("ad-view-count", newCount.toString())
    }

    const isAdFree = () => {
        if (!adFreeUntil) return false
        return Date.now() < adFreeUntil
    }

    const grantAdFree = (minutes: number) => {
        const until = Date.now() + minutes * 60 * 1000
        setAdFreeUntil(until)
        localStorage.setItem("ad-free-until", until.toString())
        // Métrica opcional
        try {
            // @ts-ignore
            window?.umami?.track?.("ad_free_granted", { minutes })
            // @ts-ignore
            window?.gtag?.("event", "ad_free_granted", { value: minutes })
        } catch {}
    }

    // Atualiza o tempo restante a cada segundo
    useEffect(() => {
        const id = window.setInterval(() => {
            if (!adFreeUntil) {
                setRemainingAdFreeMs(0)
                return
            }
            const rem = Math.max(0, adFreeUntil - Date.now())
            setRemainingAdFreeMs(rem)
            if (rem === 0) {
                setAdFreeUntil(null)
                localStorage.removeItem("ad-free-until")
            }
        }, 1000)
        return () => window.clearInterval(id)
    }, [adFreeUntil])

    const shouldShowAd = (position: string) => {
        if (!config.enabled) return false
        if (isAdFree()) return false
        
        // Verificar se a posição está habilitada
        if (position === "top" && !config.positions.top) return false
        if (position === "bottom" && !config.positions.bottom) return false
        if (position === "sidebar" && !config.positions.sidebar) return false
        if (position === "inline" && !config.positions.inline) return false

        // Verificar frequência
        return viewCount % config.frequency === 0
    }

    return (
        <AdManagerContext.Provider value={{
            config,
            updateConfig,
            shouldShowAd,
            incrementViewCount,
            isAdFree,
            grantAdFree,
            remainingAdFreeMs
        }}>
            {children}
        </AdManagerContext.Provider>
    )
}

// Componente para anúncios condicionais
export function ConditionalAd({ 
    position, 
    size = "medium",
    className 
}: {
    position: "top" | "bottom" | "sidebar" | "inline"
    size?: "small" | "medium" | "large" | "leaderboard" | "sidebar"
    className?: string
}) {
    const { shouldShowAd, incrementViewCount } = useAdManager()

    useEffect(() => {
        if (shouldShowAd(position)) {
            incrementViewCount()
        }
    }, [position, shouldShowAd, incrementViewCount])

    if (!shouldShowAd(position)) {
        return null
    }

    return (
        <AdBanner 
            position={position}
            size={size}
            className={className}
            adId={`${position}-${Date.now()}`}
        />
    )
}

// Componente para anúncios nativos condicionais
export function ConditionalNativeAd({ 
    position,
    className 
}: {
    position: "top" | "bottom" | "sidebar" | "inline"
    className?: string
}) {
    const { shouldShowAd, incrementViewCount } = useAdManager()

    useEffect(() => {
        if (shouldShowAd(position)) {
            incrementViewCount()
        }
    }, [position, shouldShowAd, incrementViewCount])

    if (!shouldShowAd(position)) {
        return null
    }

    // Exemplos de anúncios nativos
    const nativeAds = [
        {
            title: "Descubra Novos Animes",
            description: "Explore nossa coleção de animes mais populares e encontre sua próxima série favorita.",
            image: "/api/placeholder/64/64",
            ctaText: "Explorar"
        },
        {
            title: "Streaming Premium",
            description: "Aproveite qualidade HD e sem anúncios com nosso plano premium.",
            image: "/api/placeholder/64/64",
            ctaText: "Assinar"
        },
        {
            title: "Comunidade Anime",
            description: "Junte-se à nossa comunidade e discuta seus animes favoritos com outros fãs.",
            image: "/api/placeholder/64/64",
            ctaText: "Participar"
        }
    ]

    const randomAd = nativeAds[Math.floor(Math.random() * nativeAds.length)]

    return (
        <NativeAd 
            {...randomAd}
            className={className}
        />
    )
}
