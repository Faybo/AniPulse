import { ElectronManager } from "@/app/(main)/_electron/electron-manager"
import { TauriManager } from "@/app/(main)/_tauri/tauri-manager"
import { ClientProviders } from "@/app/client-providers"
import { __isElectronDesktop__, __isTauriDesktop__ } from "@/types/constants"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import React from "react"
import { GoogleAnalytics } from "@/components/shared/google-analytics"
import Script from "next/script"

export const dynamic = "force-static"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
    title: "AniPulse - Watch Anime Online Free HD",
    description: "Watch your favorite anime online for free in HD quality. Stream thousands of anime episodes with English subtitles. No registration required!",
    keywords: "anime online, watch anime free, anime streaming, naruto online, one piece anime, dragon ball, anime episodes, anime subtitles, free anime, anime HD",
    authors: [{ name: "New Naruto Ragnarok" }],
    creator: "New Naruto Ragnarok",
    publisher: "New Naruto Ragnarok",
    formatDetection: {
        email: false,
        address: false,
        telephone: false,
    },
    metadataBase: new URL("https://newnarutoragnarok.site"),
    alternates: {
        canonical: "/",
    },
    // Google Analytics
    verification: {
        google: "G-YJ73RJQJWZ",
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    icons: {
        icon: "/logo_anime.png",
        apple: "/logo_anime.png",
    },
    appleWebApp: {
        capable: true,
        statusBarStyle: "black-translucent",
        title: "New Naruto Ragnarok",
    },
    other: {
        "mobile-web-app-capable": "yes",
        "apple-mobile-web-app-capable": "yes",
        "apple-mobile-web-app-status-bar-style": "black-translucent",
        "apple-mobile-web-app-title": "New Naruto Ragnarok",
    },
}

export default function RootLayout({ children }: {
    children: React.ReactNode
}) {
    const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-YJ73RJQJWZ"
    return (
        <html lang="en" suppressHydrationWarning>
        {process.env.NODE_ENV === "development" && <head>
            <script src="https://unpkg.com/react-scan/dist/auto.global.js" async></script>
        </head>}
        <body className={inter.className} suppressHydrationWarning>
        {/* {process.env.NODE_ENV === "development" && <script src="http://localhost:8097"></script>} */}
        {GA_ID && (
            <GoogleAnalytics measurementId={GA_ID} />
        )}
        {process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID && process.env.NEXT_PUBLIC_UMAMI_SRC && (
            <Script
                defer
                data-website-id={process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID}
                src={process.env.NEXT_PUBLIC_UMAMI_SRC}
                strategy="afterInteractive"
            />
        )}
        <ClientProviders>
            {__isTauriDesktop__ && <TauriManager />}
            {__isElectronDesktop__ && <ElectronManager />}
            {children}
        </ClientProviders>
        </body>
        </html>
    )
}


