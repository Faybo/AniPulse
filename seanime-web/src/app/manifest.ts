import type { MetadataRoute } from "next"

export const dynamic = "force-static"

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: "AniPulse",
        short_name: "AniPulse",
        description:
            "Watch your favorite anime online with high quality streaming.",
        start_url: "/",
        display: "standalone",
        background_color: "#070707",
        theme_color: "#070707",
        icons: [
            {
                src: "/icons/android-chrome-192x192.png",
                sizes: "192x192",
                type: "image/png",
                purpose: "maskable",
            },
            {
                src: "/icons/android-chrome-512x512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "maskable",
            },
            {
                src: "/icons/apple-icon.png",
                sizes: "180x180",
                type: "image/png",
                purpose: "any",
            },
        ],
        scope: "/",
        id: "/",
        orientation: "portrait-primary",
        categories: ["entertainment", "multimedia"],
        lang: "en",
        dir: "ltr",
    }
}
