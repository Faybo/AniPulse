"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export default function TrackVisit() {
    const pathname = usePathname()

    useEffect(() => {
        // Evita spam em dev
        if (process.env.NODE_ENV !== "production") return
        try {
            fetch("/api/track-visit", { method: "POST", keepalive: true })
        } catch {}
    }, [pathname])

    return null
}


