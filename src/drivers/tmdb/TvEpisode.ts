import fetch from 'node-fetch'
import config from '../../common/config.js'
import { useAgent } from '../../common/agent.js'
import { getParamsStr } from '../../common/params.js'

interface RequestParams {
    series_id: number
    season_number: number
    episode_number: number
    append_to_response?: string
    language?: string
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
    crew: Array<Crew>
    guest_stars: Array<GuestStars>
}

interface Crew {
    job: string
    department: string
    credit_id: string
    adult: boolean
    gender: number
    id: number
    known_for_department: string
    name: string
    original_name: string
    popularity: number
    profile_path: string
}

interface GuestStars {
    character: string
    credit_id: string
    order: number
    adult: boolean
    gender: number
    id: number
    known_for_department: string
    name: string
    original_name: string
    popularity: number
    profile_path: string
}

const { TMDB_API_TOKEN } = config

export const getTvEpisode = async ({ series_id, season_number, episode_number, append_to_response, language = 'zh-CN' }: RequestParams) => {
    const res = await fetch(`https://api.themoviedb.org/3/tv/${series_id}/season/${season_number}/episode/${episode_number}?${getParamsStr({ append_to_response, language })}`, {
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

    return await res.json() as Episode
}