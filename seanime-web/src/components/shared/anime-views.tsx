"use client"

import { useGetAnimeViews } from "@/api/hooks/anime-views.hooks"
import { cn } from "@/components/ui/core/styling"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { FiEye } from "react-icons/fi"

interface AnimeViewsProps {
    mediaId: number
    className?: string
    showIcon?: boolean
    size?: "sm" | "md" | "lg"
}

export function AnimeViews({ 
    mediaId, 
    className, 
    showIcon = true, 
    size = "sm" 
}: AnimeViewsProps) {
    const { data: views, isLoading } = useGetAnimeViews(mediaId)

    if (isLoading) {
        return (
            <div className={cn("flex items-center gap-1", className)}>
                <LoadingSpinner />
            </div>
        )
    }

    if (!views || views === 0) {
        return null
    }

    const sizeClasses = {
        sm: "text-xs",
        md: "text-sm", 
        lg: "text-base"
    }

    const iconSizes = {
        sm: "w-3 h-3",
        md: "w-4 h-4",
        lg: "w-5 h-5"
    }

    return (
        <div className={cn(
            "flex items-center gap-1 text-muted-foreground",
            sizeClasses[size],
            className
        )}>
            {showIcon && (
                <FiEye className={cn(iconSizes[size])} />
            )}
            <span>{views.toLocaleString()}</span>
        </div>
    )
}
