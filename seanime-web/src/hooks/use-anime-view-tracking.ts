import { useIncrementAnimeViews } from "@/api/hooks/anime-views.hooks"
import { useEffect, useRef } from "react"

interface UseAnimeViewTrackingProps {
    mediaId: number
    enabled?: boolean
    delay?: number // Delay in milliseconds before tracking
}

export function useAnimeViewTracking({ 
    mediaId, 
    enabled = true, 
    delay = 3000 
}: UseAnimeViewTrackingProps) {
    const incrementViews = useIncrementAnimeViews()
    const hasTracked = useRef(false)
    const timeoutRef = useRef<NodeJS.Timeout>()

    useEffect(() => {
        if (!enabled || !mediaId || hasTracked.current) {
            return
        }

        // Clear any existing timeout
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }

        // Set a timeout to track the view after the delay
        timeoutRef.current = setTimeout(() => {
            if (!hasTracked.current) {
                incrementViews.mutate({ mediaId }, {
                    onSuccess: () => {
                        hasTracked.current = true
                    },
                    onError: (error) => {
                        console.warn("Failed to track anime view:", error)
                    }
                })
            }
        }, delay)

        // Cleanup function
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [mediaId, enabled, delay, incrementViews])

    // Reset tracking when mediaId changes
    useEffect(() => {
        hasTracked.current = false
    }, [mediaId])

    return {
        isTracking: incrementViews.isPending,
        hasTracked: hasTracked.current
    }
}
