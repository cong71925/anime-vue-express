import fetch from 'node-fetch'
import config from '../../common/config.js'
import { useAgent } from '../../common/agent.js'
import { getParamsStr } from '../../common/params.js'

interface SearchTVParams {
    query: string
    first_air_date_year?: string
    include_adult?: boolean
    language?: string
    page?: number
    year?: string
}
interface SearchTVResponseData {
    page: number
    total_pages: number
    total_results: number
    results: Array<TVContent>
}

interface TVContent {
    adult: boolean
    backdrop_path: string
    genre_ids: Array<number>
    id: number
    origin_country: Array<string>
    original_language: string
    original_name: string
    overview: string
    popularity: number
    poster_path: string
    first_air_date: string
    name: string
    vote_average: number
    vote_count: number
}

const { TMDB_API_TOKEN } = config

export const searchTV = async (params: SearchTVParams) => {
    const res = await fetch(`https://api.themoviedb.org/3/search/tv?${getParamsStr(params)}`, {
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

    return await res.json() as SearchTVResponseData
}
