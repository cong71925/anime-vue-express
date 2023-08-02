import fetch from 'node-fetch'
import { getParamsStr } from '../../common/params.js'
import { logger } from '../../common/logger.js'

interface SearchEpisodesParams {
    anime: string
    episode: number
}

interface SearchEpisodesResponseData {
    hasMore: boolean
    errorCode: number
    success: boolean
    errorMessage: string
    animes: Array<{
        animeId: number
        animeTitle: string
        type: string
        typeDescription: string
        episodes: Array<{
            episodeId: number
            episodeTitle: string
        }>
    }>
}

export const searchEpisodes = async (params: SearchEpisodesParams) => {
    const res = await fetch(`https://api.dandanplay.net/api/v2/search/episodes?${getParamsStr(params)}`, {
        method: 'get',
        headers: { 'Content-Type': 'application/json' }
    })

    if (!res.ok) {
        return null
    }

    const { success, animes, errorMessage } = await res.json() as SearchEpisodesResponseData
    if (!success || !animes) {
        logger.error(errorMessage)
        return null
    }
    return animes
}