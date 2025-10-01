"use client"

import Script from "next/script"
import { useEffect } from "react"

interface GoogleAnalyticsProps {
    measurementId: string
}

export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
    useEffect(() => {
        // Initialize Google Analytics
        if (typeof window !== "undefined" && window.gtag) {
            window.gtag("config", measurementId, {
                page_title: document.title,
                page_location: window.location.href,
            })
        }
    }, [measurementId])

    return (
        <>
            <Script
                strategy="afterInteractive"
                src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
            />
            <Script
                id="google-analytics"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
                        window.dataLayer = window.dataLayer || [];
                        function gtag(){dataLayer.push(arguments);}
                        gtag('js', new Date());
                        gtag('config', '${measurementId}', {
                            page_title: document.title,
                            page_location: window.location.href,
                        });
                    `,
                }}
            />
        </>
    )
}

// Extend Window interface for gtag
declare global {
    interface Window {
        gtag: (...args: any[]) => void
    }
}
