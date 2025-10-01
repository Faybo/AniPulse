import { useIncrementAnimeViews } from "@/api/hooks/anime-views.hooks"
import { useCallback } from "react"

export function useGlobalAnimeTracking() {
    const incrementViews = useIncrementAnimeViews()

    const trackAnimeView = useCallback((mediaId: number, type: "anime" | "manga" = "anime") => {
        console.log("🎬 Global tracking called for:", mediaId, "type:", type)
        
        if (type === "anime") {
            console.log("📈 Incrementing views for anime:", mediaId)
            console.log("🔧 Mutation state:", incrementViews.isPending, incrementViews.isError, incrementViews.isSuccess)
            
            incrementViews.mutate({ mediaId }, {
                onSuccess: (data) => {
                    console.log(`✅ Successfully tracked view for anime ${mediaId}. New count:`, data)
                },
                onError: (error) => {
                    console.error("❌ Failed to track anime view:", error)
                    console.error("Error details:", error.message, error.cause)
                }
            })
        } else {
            console.log("⚠️ Skipping view tracking for non-anime type:", type)
        }
    }, [incrementViews])

    return { trackAnimeView }
}
