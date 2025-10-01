"use client"

import React from "react"
import { cn } from "@/components/ui/core/styling"

interface AdBannerProps {
    className?: string
    size?: "small" | "medium" | "large" | "leaderboard" | "sidebar"
    position?: "top" | "bottom" | "sidebar" | "inline"
    adId?: string
}

export function AdBanner({ 
    className, 
    size = "medium", 
    position = "inline",
    adId 
}: AdBannerProps) {
    const getSizeClasses = () => {
        switch (size) {
            case "small":
                return "w-300 h-250" // 300x250
            case "medium":
                return "w-728 h-90" // 728x90
            case "large":
                return "w-970 h-250" // 970x250
            case "leaderboard":
                return "w-728 h-90" // 728x90
            case "sidebar":
                return "w-300 h-600" // 300x600
            default:
                return "w-728 h-90"
        }
    }

    const getPositionClasses = () => {
        switch (position) {
            case "top":
                return "mb-4"
            case "bottom":
                return "mt-4"
            case "sidebar":
                return "sticky top-4"
            case "inline":
                return "my-4"
            default:
                return "my-4"
        }
    }

    return (
        <div 
            className={cn(
                "flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg",
                getSizeClasses(),
                getPositionClasses(),
                className
            )}
            data-ad-id={adId}
            data-ad-position={position}
            data-ad-size={size}
        >
            <div className="text-center text-gray-500">
                <div className="text-sm font-medium mb-1">📢 Ad Space</div>
                <div className="text-xs">
                    {size === "small" && "300x250"}
                    {size === "medium" && "728x90"}
                    {size === "large" && "970x250"}
                    {size === "leaderboard" && "728x90"}
                    {size === "sidebar" && "300x600"}
                </div>
                {adId && (
                    <div className="text-xs text-gray-400 mt-1">
                        ID: {adId}
                    </div>
                )}
            </div>
        </div>
    )
}

// Componente para anúncios nativos (mais discretos)
export function NativeAd({ 
    className, 
    title,
    description,
    image,
    ctaText = "Saiba mais"
}: {
    className?: string
    title: string
    description: string
    image?: string
    ctaText?: string
}) {
    return (
        <div className={cn(
            "bg-white rounded-lg shadow-sm border p-4 hover:shadow-md transition-shadow",
            className
        )}>
            <div className="flex gap-3">
                {image && (
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex-shrink-0">
                        <img 
                            src={image} 
                            alt={title}
                            className="w-full h-full object-cover rounded-lg"
                        />
                    </div>
                )}
                <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm mb-1">
                        {title}
                    </h3>
                    <p className="text-gray-600 text-xs mb-2 line-clamp-2">
                        {description}
                    </p>
                    <button className="text-blue-600 text-xs font-medium hover:text-blue-800">
                        {ctaText} →
                    </button>
                </div>
            </div>
            <div className="text-xs text-gray-400 mt-2">
                Publicidade
            </div>
        </div>
    )
}

// Componente para anúncios de vídeo
export function VideoAd({ 
    className,
    duration = 30
}: {
    className?: string
    duration?: number
}) {
    return (
        <div className={cn(
            "bg-black rounded-lg overflow-hidden relative group",
            className
        )}>
            <div className="aspect-video bg-gray-800 flex items-center justify-center">
                <div className="text-center text-white">
                    <div className="text-4xl mb-2">▶️</div>
                    <div className="text-sm">Anúncio de Vídeo</div>
                    <div className="text-xs text-gray-400">
                        {duration}s
                    </div>
                </div>
            </div>
            <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                Anúncio
            </div>
        </div>
    )
}

