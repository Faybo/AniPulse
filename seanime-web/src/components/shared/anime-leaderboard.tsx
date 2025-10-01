import { cn } from "@/components/ui/core/styling"
import { LoadingSpinner } from "@/components/ui/loading-spinner/loading-spinner"
import { useGetTopAnimeViews, useGetTopAnimeViewsByFilter } from "@/api/hooks/anime-views.hooks"
import { useGetAnilistAnimeDetails } from "@/api/hooks/anilist.hooks"
import React, { useState } from "react"
import { IoEyeOutline, IoTrendingUpOutline } from "react-icons/io5"
import { Modal } from "@/components/ui/modal"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface AnimeLeaderboardProps {
    className?: string
}

type TimeFilter = "daily" | "weekly" | "monthly"

interface AnimeLeaderboardItemProps {
    anime: {
        id: number
        mediaId: number
        views: number
        createdAt: string
        updatedAt: string
    }
    index: number
}

function AnimeLeaderboardItem({ anime, index }: AnimeLeaderboardItemProps) {
    const formatViews = (num: number) => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + "M"
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + "K"
        }
        return num.toString()
    }

    // Buscar dados do anime diretamente do AniList
    const { data: animeData, isLoading } = useGetAnilistAnimeDetails(anime.mediaId)

    // Usar any para contornar problemas de tipos
    const animeInfo = animeData as any
    const animeTitle = animeInfo?.title?.userPreferred || animeInfo?.title?.romaji || animeInfo?.title?.english || `Anime #${anime.mediaId}`
    const animeCover = animeInfo?.coverImage?.large || animeInfo?.coverImage?.medium || animeInfo?.coverImage?.extraLarge || `https://via.placeholder.com/120x160/4f46e5/ffffff?text=${anime.mediaId}`

    if (isLoading) {
        return (
            <div className="modern-card flex items-center gap-4 p-4 m-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-200 text-sm font-bold">
                    {index + 1}
                </div>
                <div className="w-16 h-20 relative flex-shrink-0 bg-gray-200 animate-pulse rounded"></div>
                <div className="flex-1 min-w-0">
                    <div className="text-base font-semibold text-white truncate mb-1">
                        Loading...
                    </div>
                </div>
                <div className="flex items-center gap-2 text-white bg-black/20 px-3 py-2 rounded-full">
                    <IoEyeOutline className="text-lg" />
                    <span className="text-sm font-bold">
                        {formatViews(anime.views)}
                    </span>
                </div>
            </div>
        )
    }

    // Se não conseguiu carregar os dados, usar fallback
    if (!animeData) {
        return (
            <div className="modern-card flex items-center gap-4 p-4 m-2">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold shadow-lg">
                    {index + 1}
                </div>
                
                <div className="w-16 h-20 relative flex-shrink-0 rounded-lg overflow-hidden shadow-lg bg-gray-600 flex items-center justify-center">
                    <span className="text-xs text-gray-300">No Image</span>
                </div>
                
                <div className="flex-1 min-w-0">
                    <div className="text-base font-semibold text-white truncate mb-1">
                        Anime #{anime.mediaId}
                    </div>
                    <div className="text-xs text-gray-300">
                        {new Date(anime.updatedAt).toLocaleDateString('pt-PT')}
                    </div>
                </div>
                
                <div className="flex items-center gap-2 text-white bg-black/20 px-3 py-2 rounded-full">
                    <IoEyeOutline className="text-lg" />
                    <span className="text-sm font-bold">
                        {formatViews(anime.views)}
                    </span>
                </div>
            </div>
        )
    }

    return (
        <div className="modern-card flex items-center gap-4 p-4 m-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold shadow-lg">
                {index + 1}
            </div>
            
            <div className="w-16 h-20 relative flex-shrink-0 rounded-lg overflow-hidden shadow-lg">
                <Image
                    src={animeCover}
                    alt={animeTitle}
                    fill
                    className="object-cover"
                />
            </div>
            
            <div className="flex-1 min-w-0">
                <div className="text-base font-semibold text-white truncate mb-1">
                    {animeTitle}
                </div>
                <div className="text-xs text-gray-300">
                    {new Date(anime.updatedAt).toLocaleDateString('pt-PT')}
                </div>
            </div>
            
            <div className="flex items-center gap-2 text-white bg-black/20 px-3 py-2 rounded-full">
                <IoEyeOutline className="text-lg" />
                <span className="text-sm font-bold">
                    {formatViews(anime.views)}
                </span>
            </div>
        </div>
    )
}

export function AnimeLeaderboard({ className }: AnimeLeaderboardProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [timeFilter, setTimeFilter] = useState<TimeFilter>("daily")
    
    const { data: topAnime, isLoading } = useGetTopAnimeViewsByFilter(timeFilter, 20)

    const getTimeFilterLabel = (filter: TimeFilter) => {
        switch (filter) {
            case "daily": return "Diário"
            case "weekly": return "Semanal"
            case "monthly": return "Mensal"
        }
    }

    return (
        <>
            <Button
                onClick={() => setIsOpen(true)}
                intent="gray-outline"
                size="sm"
                className="rounded-full text-sm"
            >
                Leaderboard
            </Button>

            <Modal
                open={isOpen}
                onOpenChange={setIsOpen}
                title="🏆 Top Most Viewed Animes"
            >
                <div className="space-y-6 max-w-4xl mx-auto">
                    {/* Time Filter Buttons */}
                    <div className="flex gap-3 justify-center">
                        {(["daily", "weekly", "monthly"] as TimeFilter[]).map((filter) => (
                            <Button
                                key={filter}
                                onClick={() => setTimeFilter(filter)}
                                className={timeFilter === filter ? "modern-button" : "glass-effect text-white border-white/20"}
                                size="sm"
                            >
                                {getTimeFilterLabel(filter)}
                            </Button>
                        ))}
                    </div>

                    {/* Leaderboard Content */}
                    <div className="max-h-96 overflow-y-auto">
                        {isLoading ? (
                            <div className="flex justify-center py-8">
                                <LoadingSpinner />
                            </div>
                        ) : topAnime && topAnime.length > 0 ? (
                            <div className="space-y-2">
                                {topAnime.map((anime, index) => (
                                    <AnimeLeaderboardItem
                                        key={anime.id}
                                        anime={anime}
                                        index={index}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <IoEyeOutline className="text-4xl mx-auto mb-2 opacity-50" />
                                <p>No views recorded yet</p>
                                <p className="text-sm">Views will appear here when users start watching animes</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="text-center text-xs text-gray-500 pt-2 border-t">
                        <p>📊 Statistics based on real user views</p>
                        <p>🔄 Updated in real-time</p>
                    </div>
                </div>
            </Modal>
        </>
    )
}
