import { Request, Response } from 'express'
import { getEpisodeMap } from '../common/mediaList.js'
import { comment } from '../drivers/dandanplay/comment.js'

export const getDanmaku = async (req: Request, res: Response): Promise<void> => {
    const { id, season, episode } = req.query

    if (!(id && season && episode)) {
        res.status(400).send('Bad Request')
        return
    }
    const episodeMap = getEpisodeMap()
    const episodeContent = episodeMap.get(`${id}_${season}_${episode}`)

    if (!episodeContent || !episodeContent.danmakuId) {
        res.status(404).send('Not Found')
        return
    }
    const commentList = await comment({ episodeId: episodeContent.danmakuId })

    if (!commentList) {
        res.status(404).send('Not Found')
        return
    }
    
    res.json({
        code: 200,
        message: '',
        data: commentList.comments.map(({ p, m }) => ({ text: m, mode: p.split(',')[1] === '1' ? 0 : 1, time: Number(p.split(',')[0]), color: `#${parseInt(p.split(',')[2]).toString(16)}` }))
    })
}