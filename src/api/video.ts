import { Request, Response, NextFunction } from 'express'
import { getMediaList, getMediaMap, getSeasonMap, getEpisodeMap } from '../common/mediaList.js'
import { getFile, getVideoPreview } from '../drivers/alist.js'
import { logger } from '../common/logger.js'
import path from 'path'
import { fileURLToPath } from 'url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const getMedia = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.query
    if (!id) {
        res.status(400).send('Bad Request')
        return
    }
    const mediaMap = getMediaMap()
    const mediaContent = mediaMap.get(Number(id))

    if (!mediaContent) {
        res.status(404).send('Not Found')
        return
    }

    res.json({
        code: 200,
        message: '',
        data: mediaContent
    })
}

const getMediaImgPath = (id: number, type: 'poster' | 'still', size: 'original' | 'lg' | 'md' | 'sm') => {
    const mediaMap = getMediaMap()
    const mediaContent = mediaMap.get(id)
    if (!mediaContent) {
        return null
    }
    const imgPath = mediaContent?.[type === 'poster' ? 'imgPosterPath' : 'imgStillPath']?.[size]
    if (!imgPath) {
        return null
    }
    return imgPath
}

const getSeasonImgPath = (id: number, season: number, type: 'poster' | 'still', size: 'original' | 'lg' | 'md' | 'sm') => {
    const seasonMap = getSeasonMap()
    const seasonContent = seasonMap.get(`${id}_${season}`)
    if (!seasonContent) {
        return null
    }
    const imgPath = seasonContent?.[type === 'poster' ? 'imgPosterPath' : 'imgStillPath']?.[size]
    if (!imgPath) {
        return null
    }
    return imgPath
}

const getEpisodeImgPath = (id: number, season: number, episode: number, type: 'poster' | 'still', size: 'original' | 'lg' | 'md' | 'sm') => {
    const episodeMap = getEpisodeMap()
    const episodeContent = episodeMap.get(`${id}_${season}_${episode}`)
    if (!episodeContent) {
        return null
    }
    const imgPath = episodeContent?.[type === 'poster' ? 'imgPosterPath' : 'imgStillPath']?.[size]
    if (!imgPath) {
        return null
    }
    return imgPath
}

export const getImg = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { id, season, episode, type, size } = req.query
    if (!id || !size || !type) {
        res.status(400).send('Bad Request')
        return
    }
    if (type !== 'poster' && type !== 'still') {
        res.status(404).send('Not Found')
        return
    }
    if (size !== 'original' && size !== 'lg' && size !== 'md' && size !== 'sm') {
        res.status(404).send('Not Found')
        return
    }
    let imgPath: string | null
    if (!season && !episode) {
        imgPath = getMediaImgPath(Number(id), type, size)
        if (!imgPath) {
            res.status(404).send('Not Found')
            return
        }
    } else if (!episode) {
        imgPath = getSeasonImgPath(Number(id), Number(season), type, size)
        if (!imgPath) {
            res.status(404).send('Not Found')
            return
        }
    } else {
        imgPath = getEpisodeImgPath(Number(id), Number(season), Number(episode), type, size)
        if (!imgPath) {
            res.status(404).send('Not Found')
            return
        }
    }
    const options = {
        root: path.join(__dirname, '../../'),
        headers: {
            'x-timestamp': Date.now(),
            'x-sent': true
        }
    }
    res.sendFile(imgPath, options, (err) => {
        if (err) {
            next(err)
        }
    })
}

export const getSeason = async (req: Request, res: Response): Promise<void> => {
    const { id, season } = req.query

    if (!(id && season)) {
        res.status(400).send('Bad Request')
        return
    }
    const seasonMap = getSeasonMap()

    const seasonContent = seasonMap.get(`${id}_${season}`)
    if (!seasonContent) {
        res.status(404).send('Not Found')
        return
    }

    res.json({
        code: 200,
        message: '',
        data: seasonContent
    })
}

export const getEpisode = async (req: Request, res: Response): Promise<void> => {
    const { id, season, episode } = req.query

    if (!(id && season && episode)) {
        res.status(400).send('Bad Request')
        return
    }
    const seasonMap = getSeasonMap()

    const seasonContent = seasonMap.get(`${id}_${season}`)
    if (!seasonContent) {
        res.status(404).send('Not Found')
        return
    }

    const episodeMap = getEpisodeMap()
    const episodeContent = episodeMap.get(`${id}_${season}_${episode}`)
    if (!episodeContent) {
        res.status(404).send('Not Found')
        return
    }

    res.json({
        code: 200,
        message: '',
        data: {
            ...episodeContent,
            fonts: seasonContent.fonts?.map(({ name }) => name)
        }
    })
}

export const redirectFontUrl = async (req: Request, res: Response): Promise<void> => {
    const { id, season, episode, filename } = req.query
    if (!(id && season && episode)) {
        res.status(400).send('Bad Request')
        return
    }
    const seasonMap = getSeasonMap()

    const seasonContent = seasonMap.get(`${id}_${season}`)
    if (!seasonContent) {
        res.status(404).send('Not Found')
        return
    }

    const episodeMap = getEpisodeMap()
    const episodeContent = episodeMap.get(`${id}_${season}_${episode}`)
    if (!episodeContent) {
        res.status(404).send('Not Found')
        return
    }
    
    
    const fileInfo = seasonContent.fonts?.find(({ name }) => name === filename)
    if (!fileInfo) {
        res.status(404).send('Not Found')
        return
    }

    const fileDownloadContent = await getFile(fileInfo.path)
    if (!fileDownloadContent || !fileDownloadContent.raw_url) {
        res.status(404).send('Not Found')
    }
    
    res.status(302).redirect(fileDownloadContent.raw_url)
}

export const redirectVideoViewUrl = async (req: Request, res: Response): Promise<void> => {
    const { id, season, episode } = req.query

    if (!(id && season && episode)) {
        res.status(400).send('Bad Request')
        return
    }


    const mediaMap = getMediaMap()
    const mediaContent = mediaMap.get(Number(id))

    if (!mediaContent) {
        res.status(404).send('Not Found')
        return
    }

    const seasonMap = getSeasonMap()
    const seasonContent = seasonMap.get(`${id}_${season}`)
    if (!seasonContent) {
        res.status(404).send('Not Found')
        return
    }

    const episodeMap = getEpisodeMap()
    const episodeContent = episodeMap.get(`${id}_${season}_${episode}`)
    if (!episodeContent) {
        res.status(404).send('Not Found')
        return
    }
    logger.info(`${req.ips.join(' -> ')} - Get id:${id} ${mediaContent.name} S${season}E${episode} view url`)

    const MEDIA_PATH = mediaContent.folderPath
    const fileDownloadContent = await getFile(`${MEDIA_PATH}/${mediaContent.folderName}/${seasonContent.folderName}/${episodeContent.fileName}`)
    if (!fileDownloadContent || !fileDownloadContent.raw_url) {
        res.status(404).send('Not Found')
    }
    res.status(302).redirect(fileDownloadContent.raw_url)
}

export const redirectSubtitleUrl = async (req: Request, res: Response): Promise<void> => {
    const { id, season, episode, subtitle } = req.query

    if (!(id && season && episode && subtitle)) {
        res.status(400).send('Bad Request')
        return
    }
    const mediaMap = getMediaMap()
    const mediaContent = mediaMap.get(Number(id))

    if (!mediaContent) {
        res.status(404).send('Not Found')
        return
    }

    const seasonMap = getSeasonMap()
    const seasonContent = seasonMap.get(`${id}_${season}`)
    if (!seasonContent) {
        res.status(404).send('Not Found')
        return
    }

    const episodeMap = getEpisodeMap()
    const episodeContent = episodeMap.get(`${id}_${season}_${episode}`)
    if (!episodeContent) {
        res.status(404).send('Not Found')
        return
    }

    const MEDIA_PATH = mediaContent.folderPath
    const subtitleContent = episodeContent.subtitleList?.find(({ fileName }) => fileName === subtitle)

    if (!subtitleContent) {
        res.status(404).send('Not Found')
        return
    }

    const fileDownloadContent = await getFile(`${MEDIA_PATH}/${mediaContent.folderName}/${seasonContent.folderName}/${subtitleContent.fileName}`).catch(() => {
        res.status(404).send('Not Found')
        return
    })
    if (!fileDownloadContent || !fileDownloadContent.raw_url) {
        res.status(404).send('Not Found')
        return
    }
    res.status(302).redirect(fileDownloadContent.raw_url)
}

export const getVideoPreviewData = async (req: Request, res: Response): Promise<void> => {
    const { id, season, episode } = req.query
    if (!(id && season && episode)) {
        res.status(400).send('Bad Request')
        return
    }
    const mediaMap = getMediaMap()
    const mediaContent = mediaMap.get(Number(id))

    if (!mediaContent) {
        res.status(404).send('Not Found')
        return
    }

    const seasonMap = getSeasonMap()
    const seasonContent = seasonMap.get(`${id}_${season}`)
    if (!seasonContent) {
        res.status(404).send('Not Found')
        return
    }

    const episodeMap = getEpisodeMap()
    const episodeContent = episodeMap.get(`${id}_${season}_${episode}`)
    if (!episodeContent) {
        res.status(404).send('Not Found')
        return
    }

    const MEDIA_PATH = mediaContent.folderPath
    const videoPreviewData = await getVideoPreview(`${MEDIA_PATH}/${mediaContent.folderName}/${seasonContent.folderName}/${episodeContent.fileName}`).catch(() => {
        res.status(404).send('Not Found')
        return
    })

    const transcodedList = videoPreviewData?.video_preview_play_info.live_transcoding_task_list.filter(({ status }) => status === 'finished')
    res.json({
        code: 200,
        message: '',
        data: transcodedList?.map((item) => ({ name: item.template_id, url: item.url, height: item.template_height, width: item.template_width })).sort((a, b) => b.width - a.width)
    })
}

export const getVideoList = (req: Request, res: Response): void => {
    const mediaList = getMediaList()
    res.json({
        code: 200,
        message: '',
        data: mediaList.sort((a, b) => (b?.lastUpdateInfo?.lastUpdate || 0) - (a?.lastUpdateInfo?.lastUpdate || 0)).map((item) => ({ id: item.id, name: item.name, overview: item.overview }))
    })
}

export const getLastUpdateMediaInfo = async (req: Request, res: Response): Promise<void> => {
    const count = isNaN(Number(req.query.count)) ? 5 : Number(req.query.count)

    const mediaList = getMediaList().sort((a, b) => (b.lastUpdateInfo?.lastUpdate || 0) - (a.lastUpdateInfo?.lastUpdate || 0))

    const result = []
    for (let index = 0, { length } = mediaList; index < length && result.length < count; index++) {
        const mediaContent = mediaList[index]
        if (!mediaContent?.lastUpdateInfo) {
            continue
        }
        if (!mediaContent.seasonList) {
            continue
        }
        const lastUpdateSeason = mediaContent.seasonList.find(({ seasonIndex }) => seasonIndex === mediaContent.lastUpdateInfo?.seasonIndex)
        if (!lastUpdateSeason) {
            continue
        }
        const lastUpdateEpisode = lastUpdateSeason.episodeList?.find(({ episodeIndex }) => episodeIndex === mediaContent.lastUpdateInfo?.episodeIndex)
        if (!lastUpdateEpisode) {
            continue
        }
        result.push({ name: mediaContent.name, id: mediaContent.id, lastUpdateInfo: { ...mediaContent.lastUpdateInfo, ...lastUpdateEpisode } })
    }

    res.json({
        code: 200,
        message: '',
        data: result
    })
}