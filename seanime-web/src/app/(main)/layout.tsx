"use client"
import { MainLayout } from "@/app/(main)/_features/layout/main-layout"
import { OfflineLayout } from "@/app/(main)/_features/layout/offline-layout"
import { TopNavbar } from "@/app/(main)/_features/layout/top-navbar"
import { useServerStatus } from "@/app/(main)/_hooks/use-server-status"
import { ServerDataWrapper } from "@/app/(main)/server-data-wrapper"
import { GoogleAnalytics } from "@/components/analytics/google-analytics"
import Script from "next/script"
import { AdManagerProvider } from "@/components/ads/ad-manager"
import React from "react"
import TrackVisit from "@/components/analytics/track-visit"
// Estilos globais do Vidstack para garantir layout correto dos controlos
import "@vidstack/react/player/styles/base.css"
import "@vidstack/react/player/styles/default/layouts/video.css"
import "@vidstack/react/player/styles/default/theme.css"

export default function Layout({ children }: { children: React.ReactNode }) {

    const serverStatus = useServerStatus()

    const [host, setHost] = React.useState<string>("")

    React.useEffect(() => {
        setHost(window?.location?.host || "")
    }, [])

    if (serverStatus?.isOffline) {
        return (
            <ServerDataWrapper host={host}>
                <OfflineLayout>
                    <div data-offline-layout-container className="h-auto">
                        <TopNavbar />
                        <div data-offline-layout-content>
                            {children}
                        </div>
                    </div>
                </OfflineLayout>
            </ServerDataWrapper>
        )
    }

    const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-YJ73RJQJWZ"

    return (
        <ServerDataWrapper host={host}>
            {GA_ID && <GoogleAnalytics measurementId={GA_ID} />}
            {process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID && process.env.NEXT_PUBLIC_UMAMI_SRC && (
                <Script
                    defer
                    data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
                    src={process.env.NEXT_PUBLIC_UMAMI_SRC}
                    strategy="afterInteractive"
                />
            )}
            <AdManagerProvider>
                <MainLayout>
                    <div data-main-layout-container className="h-auto">
                        <TopNavbar />
                        <div data-main-layout-content>
                            <TrackVisit />
                            {children}
                        </div>
                    </div>
                </MainLayout>
            </AdManagerProvider>
            {/* Tracking será feito pelo backend quando servir páginas em produção */}
        </ServerDataWrapper>
    )

}


export const dynamic = "force-static"
