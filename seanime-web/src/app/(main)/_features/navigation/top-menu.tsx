"use client"
import { useServerStatus } from "@/app/(main)/_hooks/use-server-status"
import { Badge } from "@/components/ui/badge"
import { NavigationMenu, NavigationMenuProps } from "@/components/ui/navigation-menu"
import { usePathname } from "next/navigation"
import React, { useMemo } from "react"

interface TopMenuProps {
    children?: React.ReactNode
}

export const TopMenu: React.FC<TopMenuProps> = (props) => {

    const { children, ...rest } = props

    const serverStatus = useServerStatus()

    const pathname = usePathname()

    const navigationItems = useMemo<NavigationMenuProps["items"]>(() => {

        return [
            // Schedule removido do menu superior a pedido (ocultar "Your Schedule")
            ...[serverStatus?.settings?.library?.enableManga && {
                href: "/manga",
                icon: null,
                isCurrent: pathname.startsWith("/manga"),
                name: "Manga",
            }].filter(Boolean) as NavigationMenuProps["items"],
            {
                href: "/discover",
                icon: null,
                isCurrent: pathname.startsWith("/discover") || pathname.startsWith("/search"),
                name: "Discover",
            },
            {
                href: "/anilist",
                icon: null,
                isCurrent: pathname.startsWith("/anilist"),
                name: serverStatus?.user?.isSimulated ? "My lists" : "AniList",
            },
        ].filter(Boolean)
    }, [pathname, serverStatus?.settings?.library?.enableManga])

    return (
        <div className="flex items-center justify-between w-full">
            {/* AniPulse Logo/Title */}
            <div className="flex items-center">
                <a href="/" aria-label="Go to Discover" className="outline-none focus:ring-2 focus:ring-purple-500 rounded">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 bg-clip-text text-transparent animate-pulse">
                        <span className="relative">
                            <span className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-lg blur opacity-75 animate-pulse"></span>
                            <span className="relative bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500 bg-clip-text text-transparent font-black text-4xl tracking-wider">
                                AniPulse
                            </span>
                        </span>
                    </h1>
                </a>
            </div>

            {/* Navigation Menu */}
            <NavigationMenu
                className="p-0 hidden lg:flex justify-center flex-1"
                itemClass="text-xl"
                items={navigationItems}
                data-top-menu
            />
        </div>
    )

}
