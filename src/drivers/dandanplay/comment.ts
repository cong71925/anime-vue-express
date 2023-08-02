import fetch from 'node-fetch'
import { logger } from '../../common/logger.js'

interface CommentParams {
    episodeId: number
    from?: number
    withRelated?: boolean
    chConvert?: ChConvert
}
enum ChConvert {
    original = 0,
    zhs = 1,
    zht = 2
}

interface CommentResponseData {
    count: number
    comments: Array<{
        cid: number
        p: string
        m: string
    }>
}

export const comment = async ({ episodeId, from, withRelated = true, chConvert }: CommentParams) => {
    const res = await fetch(`https://api.dandanplay.net/api/v2/comment/${episodeId}?from=${from}&withRelated=${withRelated}&chConvert=${chConvert}`, {
        method: 'get',
        headers: { 'Content-Type': 'application/json' }
    })
    if(!res.ok) {
        return null
    }
    const data = await res.json() as CommentResponseData
    if(!data) {
        logger.error(`episodeId: ${episodeId} danmaku not found`)
        return null
    }
    return data
}