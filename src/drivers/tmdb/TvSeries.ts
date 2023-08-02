import fetch from 'node-fetch'
import config from '../../common/config.js'
import { useAgent } from '../../common/agent.js'
import { getParamsStr } from '../../common/params.js'

interface RequestParams {
    series_id: number
    append_to_response?: string
    language?: string
}
interface ResponseData {
    adult: boolean
    backdrop_path: string
    id: number
    name: string
    origin_country: Array<string>
    original_language: string
    original_name: string
    overview: string
    popularity: number
    poster_path: string
    first_air_date: string
    vote_average: number
    vote_count: number
    seasons: Array<Season>
}
export interface Season {
    air_date: string
    episode_count: number
    id: number
    name: string
    overview: string
    poster_path: string
    season_number: number
}

const { TMDB_API_TOKEN } = config

export const getTvSeries = async ({ series_id, append_to_response, language = 'zh-CN' }: RequestParams) => {
    const res = await fetch(`https://api.themoviedb.org/3/tv/${series_id}?${getParamsStr({ append_to_response, language })}`, {
        agent: (url) => useAgent(url, 'tmdb'),
        method: 'get',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${TMDB_API_TOKEN}`
        }
    })

    if (!res.ok) {
        return null
    }

    if (!res.body) {
        return null
    }

    return await res.json() as ResponseData
}