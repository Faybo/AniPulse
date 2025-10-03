"use client"

import React, { useEffect, useRef } from "react"
import { markEpisodeWatched, getAnimeProgress, isEpisodeWatched } from "@/lib/local-progress/local-progress-storage"

/**
 * Componente que integra automaticamente o progresso local ao player
 * Detecta quando um episódio termina e marca como assistido
 */
export function ProgressTracker({
    mediaId,
    episodeNumber,
    animeTitle
}: {
    mediaId: number
    episodeNumber: number
    animeTitle?: string
}) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const progressRef = useRef<number>(0)
    const watchedRef = useRef<boolean>(false)

    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        const handleTimeUpdate = () => {
            const currentTime = video.currentTime
            const duration = video.duration

            if (duration > 0) {
                const progress = (currentTime / duration) * 100
                progressRef.current = progress

                // Se passou de 90% do episódio, marcar como assistido
                if (progress >= 90 && !watchedRef.current) {
                    watchedRef.current = true

                    // Verificar se já foi marcado como assistido
                    if (!isEpisodeWatched(mediaId, episodeNumber)) {
                        markEpisodeWatched(mediaId, episodeNumber, animeTitle)

                        // Feedback visual opcional
                        console.log(`✅ Episódio ${episodeNumber} de ${animeTitle} marcado como assistido!`)

                        // Tracking opcional
                        try {
                            // @ts-ignore
                            window?.gtag?.("event", "episode_completed", {
                                anime_id: mediaId,
                                episode_number: episodeNumber,
                                anime_title: animeTitle
                            })
                            // @ts-ignore
                            window?.umami?.track?.("episode_completed", {
                                anime_id: mediaId,
                                episode_number: episodeNumber
                            })
                        } catch {}
                    }
                }
            }
        }

        const handleEnded = () => {
            // Garantir que marque como assistido quando terminar
            if (!watchedRef.current && !isEpisodeWatched(mediaId, episodeNumber)) {
                markEpisodeWatched(mediaId, episodeNumber, animeTitle)
                watchedRef.current = true

                console.log(`✅ Episódio ${episodeNumber} de ${animeTitle} marcado como assistido (ended)!`)

                // Tracking
                try {
                    // @ts-ignore
                    window?.gtag?.("event", "episode_completed", {
                        anime_id: mediaId,
                        episode_number: episodeNumber,
                        anime_title: animeTitle
                    })
                } catch {}
            }
        }

        video.addEventListener('timeupdate', handleTimeUpdate)
        video.addEventListener('ended', handleEnded)

        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate)
            video.removeEventListener('ended', handleEnded)
        }
    }, [mediaId, episodeNumber, animeTitle])

    // Componente invisível, apenas para tracking
    return (
        <div style={{ display: 'none' }}>
            <video ref={videoRef} />
        </div>
    )
}

/**
 * Hook para obter progresso de um anime
 */
export function useAnimeProgress(mediaId: number) {
    const [progress, setProgress] = React.useState(() => getAnimeProgress(mediaId))

    useEffect(() => {
        setProgress(getAnimeProgress(mediaId))
    }, [mediaId])

    return progress
}

/**
 * Hook para verificar se um episódio foi assistido
 */
export function useIsEpisodeWatched(mediaId: number, episodeNumber: number) {
    const [watched, setWatched] = React.useState(() => isEpisodeWatched(mediaId, episodeNumber))

    useEffect(() => {
        setWatched(isEpisodeWatched(mediaId, episodeNumber))
    }, [mediaId, episodeNumber])

    return watched
}


