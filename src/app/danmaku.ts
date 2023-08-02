import { getMediaList, setMediaList } from '../common/mediaList.js'
import { logger } from '../common/logger.js'
import { getMD5 } from '../common/md5.js'
import { match } from '../drivers/dandanplay/match.js'
import { getFile } from '../drivers/alist.js'
import { MediaContent, SeasonContent, EpisodeContent } from '../types/media.js'

const matchMax = 2
let matchCount = 0

export const scanDanmukuId = async (): Promise<void> => {
    matchCount = 0
    const mediaList = getMediaList()
    for (let i = 0, { length } = mediaList; i < length && matchCount < matchMax; i++) {
        const mediaContent = await getVideoDanmakuId(mediaList[i])
        if (!mediaContent) {
            continue
        }
        mediaList[i] = mediaContent
    }
    logger.info('Scan danmuku ids finish')
    setMediaList(mediaList)
}

const getVideoDanmakuId = async (mediaContent: MediaContent): Promise<MediaContent | null> => {
    const name = mediaContent.name || mediaContent.folderName

    const { seasonList, folderName } = mediaContent
    if (!seasonList || !name) {
        return null
    }
    for (let i = 0, { length } = seasonList; i < length && matchCount < matchMax; i++) {
        const seasonContent = await getSeasonDanmakuId(seasonList[i], name, `${mediaContent.folderPath}/${folderName}`)
        if (!seasonContent) {
            continue
        }
        seasonList[i] = seasonContent
    }
    return mediaContent
}

const getSeasonDanmakuId = async (seasonContent: SeasonContent, mediaName: string, mediaPath: string): Promise<SeasonContent | null> => {
    const { episodeList, seasonIndex, folderName } = seasonContent
    if (!episodeList) {
        return null
    }
    for (let i = 0, { length } = episodeList; i < length && matchCount < matchMax; i++) {
        const episodeContent = episodeList[i]
        const result = await getEpisodeDanmakuId(episodeContent, mediaName, seasonIndex, mediaPath, folderName)
        if (!result) {
            continue
        }
        episodeContent.danmakuId = result.episodeId
        episodeContent.hash = result.hash
        episodeContent.isMatched = result.isMatched
    }
    return seasonContent
}

const getEpisodeDanmakuId = async (episode: EpisodeContent, mediaName: string, seasonIndex: number, mediaPath: string, seasonPath: string): Promise<{ episodeId: number, hash: string | undefined, isMatched: boolean } | null> => {
    const { size, episodeIndex, fileName, isMatched } = episode
    let { hash } = episode
    if (isMatched || !size) {
        return null
    }
    if (!hash) {
        const { raw_url } = await getFile(`${mediaPath}/${seasonPath}/${fileName}`)
        const temp = await getMD5(raw_url)
        hash = temp ? temp : hash
        matchCount = matchCount + 1
        await new Promise<void>((resolve) => setTimeout(() => resolve(), 1500))
    }
    const matchData = await match({ filename: `${mediaName} S${seasonIndex}E${episodeIndex}}`, fileSize: size, fileHash: hash })
    if (!matchData || !matchData.matches || !matchData.matches.length || !matchData.matches[0]) {
        return null
    }
    const { episodeId } = matchData.matches[0]
    return { episodeId, hash, isMatched: matchData.isMatched }
}
