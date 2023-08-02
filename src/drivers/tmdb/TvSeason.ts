import fetch from 'node-fetch'
import config from '../../common/config.js'
import { useAgent } from '../../common/agent.js'
import { getParamsStr } from '../../common/params.js'

interface RequestParams {
    series_id: number
    season_number: number
    append_to_response?: string
    language?: string
}
export interface Season {
    _id: string
    air_date: string
    id: number
    name: string
    overview: string
    poster_path: string
    season_number: number
    episodes: Array<Episode>
}
export interface Episode {
    air_date: string
    episode_number: number
    id: number
    name: string
    overview: string
    production_code: string
    runtime: number
    season_number: number
    show_id: number
    still_path: string
    vote_average: number
    vote_count: number
    crew: Array<any>
    guest_stars: Array<any>
}

const { TMDB_API_TOKEN } = config

export const getTvSeason = async ({ series_id, season_number, append_to_response, language = 'zh-CN' }: RequestParams) => {
    const res = await fetch(`https://api.themoviedb.org/3/tv/${series_id}/season/${season_number}?${getParamsStr({ append_to_response, language })}`, {
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

    return await res.json() as Season
}