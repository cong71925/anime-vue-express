import fetch from 'node-fetch'
import { logger } from '../../common/logger.js'
interface MatchParams {
    filename: string
    fileHash?: string
    fileSize: number
    videoDuration?: number
    matchMode?: string
}

interface MatchResponseData {
    isMatched: boolean
    errorCode: number
    success: boolean
    errorMessage: string
    matches: Array<MatchResponseMatche>
}

interface MatchResponseMatche {
    episodeId: number
    animeId: number
    animeTitle: string
    episodeTitle: string
    type: string
    typeDescription: string
    shift: number
}

export const match = async ({ filename, fileHash = '00000000000000000000000000000000', fileSize, videoDuration, matchMode }: MatchParams) => {
    const res = await fetch('https://api.dandanplay.net/api/v2/match', {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, fileHash, fileSize, videoDuration, matchMode })
    })
    if(!res.ok) {
        return null
    }
    const matchResponseData = await res.json() as MatchResponseData
    const { success, matches, errorMessage } = matchResponseData
    if (!success || !matches) {
        logger.error(errorMessage)
        return null
    }
    return matchResponseData
}