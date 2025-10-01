import { useServerQuery, useServerMutation } from "@/api/client/requests"
import { useQueryClient } from "@tanstack/react-query"

export const useGetAnimeViews = (mediaId: number) => {
    return useServerQuery<number>({
        endpoint: `/api/v1/anime/views/${mediaId}`,
        method: "GET",
        queryKey: ["anime-views", mediaId],
        enabled: !!mediaId,
    })
}

export const useIncrementAnimeViews = () => {
    const queryClient = useQueryClient()
    
    return useServerMutation<number, { mediaId: number }>({
        endpoint: "/api/v1/anime/views/increment",
        method: "POST",
        onSuccess: (data, variables) => {
            // Update the cache for this specific anime
            if (data !== undefined) {
                queryClient.setQueryData(["anime-views", variables.mediaId], data)
            }
        },
    })
}

export const useGetTopAnimeViews = (limit: number = 10) => {
    return useServerQuery<Array<{
        id: number
        mediaId: number
        views: number
        createdAt: string
        updatedAt: string
        lastViewedAt?: string
    }>>({
        endpoint: `/api/v1/anime/views/top?limit=${limit}`,
        method: "GET",
        queryKey: ["anime-views-top", limit],
    })
}

export const useGetTopAnimeViewsByFilter = (filter: "daily" | "weekly" | "monthly", limit: number = 10) => {
    return useServerQuery<Array<{
        id: number
        mediaId: number
        views: number
        createdAt: string
        updatedAt: string
        lastViewedAt?: string
    }>>({
        endpoint: `/api/v1/anime/views/top/${filter}?limit=${limit}`,
        method: "GET",
        queryKey: ["anime-views-top", filter, limit],
    })
}
