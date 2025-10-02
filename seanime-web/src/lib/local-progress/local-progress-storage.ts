"use client"

/**
 * Sistema de progresso local para visitantes não autenticados
 * Salva episódios assistidos no localStorage do navegador
 */

export interface LocalAnimeProgress {
    animeId: number
    title?: string
    currentEpisode: number
    totalEpisodes?: number
    lastWatched: number // timestamp
    watchedEpisodes: number[] // lista de episódios assistidos
}

const LOCAL_PROGRESS_KEY = "anipulse_local_progress"
const LOCAL_HISTORY_KEY = "anipulse_watch_history"

/**
 * Obter todo o progresso local
 */
export function getLocalProgress(): LocalAnimeProgress[] {
    if (typeof window === "undefined") return []
    
    try {
        const data = localStorage.getItem(LOCAL_PROGRESS_KEY)
        if (!data) return []
        return JSON.parse(data) as LocalAnimeProgress[]
    } catch (error) {
        console.error("Erro ao carregar progresso local:", error)
        return []
    }
}

/**
 * Obter progresso de um anime específico
 */
export function getAnimeProgress(animeId: number): LocalAnimeProgress | null {
    const allProgress = getLocalProgress()
    return allProgress.find(p => p.animeId === animeId) || null
}

/**
 * Salvar/atualizar progresso de um anime
 */
export function saveAnimeProgress(progress: LocalAnimeProgress): void {
    if (typeof window === "undefined") return
    
    try {
        const allProgress = getLocalProgress()
        const index = allProgress.findIndex(p => p.animeId === progress.animeId)
        
        if (index >= 0) {
            allProgress[index] = progress
        } else {
            allProgress.push(progress)
        }
        
        localStorage.setItem(LOCAL_PROGRESS_KEY, JSON.stringify(allProgress))
    } catch (error) {
        console.error("Erro ao salvar progresso:", error)
    }
}

/**
 * Marcar episódio como assistido
 */
export function markEpisodeWatched(animeId: number, episodeNumber: number, animeTitle?: string, totalEpisodes?: number): void {
    const progress = getAnimeProgress(animeId) || {
        animeId,
        title: animeTitle,
        currentEpisode: episodeNumber,
        totalEpisodes,
        lastWatched: Date.now(),
        watchedEpisodes: []
    }
    
    // Adicionar episódio à lista se não existir
    if (!progress.watchedEpisodes.includes(episodeNumber)) {
        progress.watchedEpisodes.push(episodeNumber)
        progress.watchedEpisodes.sort((a, b) => a - b)
    }
    
    // Atualizar episódio atual e timestamp
    progress.currentEpisode = Math.max(progress.currentEpisode, episodeNumber)
    progress.lastWatched = Date.now()
    progress.title = animeTitle || progress.title
    progress.totalEpisodes = totalEpisodes || progress.totalEpisodes
    
    saveAnimeProgress(progress)
    
    // Adicionar ao histórico
    addToWatchHistory(animeId, episodeNumber, animeTitle)
}

/**
 * Verificar se um episódio foi assistido
 */
export function isEpisodeWatched(animeId: number, episodeNumber: number): boolean {
    const progress = getAnimeProgress(animeId)
    if (!progress) return false
    return progress.watchedEpisodes.includes(episodeNumber)
}

/**
 * Obter próximo episódio a assistir
 */
export function getNextEpisode(animeId: number): number {
    const progress = getAnimeProgress(animeId)
    if (!progress) return 1
    return progress.currentEpisode + 1
}

/**
 * Limpar progresso de um anime
 */
export function clearAnimeProgress(animeId: number): void {
    if (typeof window === "undefined") return
    
    try {
        const allProgress = getLocalProgress()
        const filtered = allProgress.filter(p => p.animeId !== animeId)
        localStorage.setItem(LOCAL_PROGRESS_KEY, JSON.stringify(filtered))
    } catch (error) {
        console.error("Erro ao limpar progresso:", error)
    }
}

/**
 * Histórico de animes assistidos recentemente
 */
export interface WatchHistoryItem {
    animeId: number
    episodeNumber: number
    title?: string
    timestamp: number
}

/**
 * Adicionar ao histórico de visualização
 */
export function addToWatchHistory(animeId: number, episodeNumber: number, title?: string): void {
    if (typeof window === "undefined") return
    
    try {
        const history = getWatchHistory()
        
        // Remover entrada antiga do mesmo anime+episódio
        const filtered = history.filter(h => !(h.animeId === animeId && h.episodeNumber === episodeNumber))
        
        // Adicionar nova entrada no início
        filtered.unshift({
            animeId,
            episodeNumber,
            title,
            timestamp: Date.now()
        })
        
        // Manter apenas últimas 50 entradas
        const limited = filtered.slice(0, 50)
        
        localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(limited))
    } catch (error) {
        console.error("Erro ao adicionar ao histórico:", error)
    }
}

/**
 * Obter histórico de visualização
 */
export function getWatchHistory(): WatchHistoryItem[] {
    if (typeof window === "undefined") return []
    
    try {
        const data = localStorage.getItem(LOCAL_HISTORY_KEY)
        if (!data) return []
        return JSON.parse(data) as WatchHistoryItem[]
    } catch (error) {
        console.error("Erro ao carregar histórico:", error)
        return []
    }
}

/**
 * Limpar todo o histórico
 */
export function clearWatchHistory(): void {
    if (typeof window === "undefined") return
    localStorage.removeItem(LOCAL_HISTORY_KEY)
}

/**
 * Limpar todos os dados locais (progresso + histórico)
 */
export function clearAllLocalData(): void {
    if (typeof window === "undefined") return
    localStorage.removeItem(LOCAL_PROGRESS_KEY)
    localStorage.removeItem(LOCAL_HISTORY_KEY)
}

/**
 * Exportar dados locais (para backup)
 */
export function exportLocalData(): string {
    const progress = getLocalProgress()
    const history = getWatchHistory()
    return JSON.stringify({ progress, history, exportedAt: Date.now() }, null, 2)
}

/**
 * Importar dados locais (restaurar backup)
 */
export function importLocalData(jsonData: string): boolean {
    try {
        const data = JSON.parse(jsonData)
        if (data.progress && Array.isArray(data.progress)) {
            localStorage.setItem(LOCAL_PROGRESS_KEY, JSON.stringify(data.progress))
        }
        if (data.history && Array.isArray(data.history)) {
            localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(data.history))
        }
        return true
    } catch (error) {
        console.error("Erro ao importar dados:", error)
        return false
    }
}

