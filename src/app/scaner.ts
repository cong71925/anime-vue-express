import { getFileList } from '../drivers/alist.js'
import { logger } from '../common/logger.js'
import { getMediaList, setMediaList } from '../common/mediaList.js'
import config from '../common/config.js'
import * as Media from '../types/media.js'

const { ALIST_MEDIA_PATH_LIST } = config

export const scanMedia = async (): Promise<void> => {
    for (let i = 0; i < ALIST_MEDIA_PATH_LIST.length; i++) {
        const path = ALIST_MEDIA_PATH_LIST[i]
        const mediaList = getMediaList()
        const mediaMap = await scanMediaSeries(path, new Map(mediaList.map((item) => [`${path}/${item.folderName}`, item])))
        setMediaList([...mediaMap.values()])
        logger.info('Scan media list finish')
    }
}

const getNewId = async () => {
    const mediaList = getMediaList()
    const idSet = new Set(mediaList.map(({ id }) => id))
    let id = Date.now()
    while (idSet.has(id)) {
        await new Promise<void>((resolve) => setTimeout(() => resolve(), 20))
        id = Date.now()
    }
    return id
}

const scanMediaSeries = async (path: string, mediaMap: Map<string, Media.MediaContent>) => {
    const fileList = await getFileList(path)

    for (let index = 0, { length } = fileList; index < length; index++) {
        const fileContent = fileList[index]
        const { name } = fileContent
        const id = await getNewId()
        if (!mediaMap.has(`${path}/${name}`)) {
            mediaMap.set(`${path}/${name}`, { id, folderName: name, folderPath: path, seasonList: [] })
        }
        const { seasonList, lastUpdateInfo } = await scanMediaSeason(`${path}/${name}`, mediaMap.get(`${path}/${name}`)?.seasonList)
        mediaMap.set(`${path}/${name}`, { ...mediaMap.get(`${path}/${name}`), id: mediaMap.get(`${path}/${name}`)?.id || id, folderName: name, folderPath: path, seasonList, lastUpdateInfo: { seasonIndex: lastUpdateInfo?.seasonIndex, episodeIndex: lastUpdateInfo?.episodeIndex, lastUpdate: lastUpdateInfo?.lastUpdate } })
        await new Promise<void>((resolve) => setTimeout(() => resolve(), 20))
    }
    return mediaMap
}

const scanMediaSeason = async (path: string, seasonList: Array<Media.SeasonContent> | undefined) => {
    if (!seasonList) {
        return { seasonList: [] }
    }
    const fileList = await getFileList(path)
    const seasonRegx = new RegExp('(season *(?<seasonIndex0>[0-9]+))|(s *(?<seasonIndex1>[0-9]+))', 'i')
    const seasonMap = new Map(seasonList.map((item) => [item.seasonIndex, item]))
    const specialsRegx = new RegExp('specials', 'i')
    const p = { max: 0, seasonIndex: 0, lastUpdateInfo: {} as Media.EpisodeContent }
    for (let index = 0, { length } = fileList; index < length; index++) {
        const fileContent = fileList[index]
        const { is_dir, name } = fileContent
        if (!is_dir || !seasonRegx.test(name)) {
            continue
        }
        const { groups } = seasonRegx.exec(name) || {}
        const seasonIndex = parseInt(groups?.['seasonIndex0'] || groups?.['seasonIndex1'] || '')
        const { episodeList, lastUpdateInfo } = await scanMediaEpisode(`${path}/${name}`, seasonMap.get(seasonIndex)?.episodeList)
        const fonts = await scanMediaFonts(`${path}/${name}`)
        seasonMap.set(seasonIndex, {
            ...seasonMap.get(seasonIndex) || { seasonIndex, folderName: name, episodeList },
            seasonIndex,
            folderName: name,
            episodeList,
            fonts: fonts ? fonts : undefined
        })
        if (lastUpdateInfo.lastUpdate && lastUpdateInfo.lastUpdate > p.max) {
            p.max = lastUpdateInfo.lastUpdate
            p.seasonIndex = seasonIndex
            p.lastUpdateInfo = lastUpdateInfo
        }
    }
    const specials = fileList.find(item => specialsRegx.test(item.name))
    if (specials) {
        const { name } = specials
        const fonts = await scanMediaFonts(`${path}/${name}`)
        const { episodeList, lastUpdateInfo } = await scanMediaEpisode(`${path}/${name}`, seasonMap.get(0)?.episodeList)
        seasonMap.set(0, {
            ...seasonMap.get(0) || { seasonIndex: 0, folderName: name, episodeList },
            seasonIndex: 0,
            folderName: name,
            episodeList,
            fonts: fonts ? fonts : undefined
        })
        if (lastUpdateInfo.lastUpdate && lastUpdateInfo.lastUpdate > p.max) {
            p.max = lastUpdateInfo.lastUpdate
            p.seasonIndex = 0
            p.lastUpdateInfo = lastUpdateInfo
        }
    }
    const resultList = [...seasonMap.values()].sort((a, b) => a.seasonIndex - b.seasonIndex)
    return {
        seasonList: resultList,
        lastUpdateInfo: { ...p.lastUpdateInfo, seasonIndex: p.seasonIndex }
    }
}

const scanMediaFonts = async (path: string) => {
    console.log(path)
    let fileList = await getFileList(path)
    const fontsRegx = new RegExp('font', 'i')
    const fileContent = fileList.find(({ name, is_dir }) => is_dir && fontsRegx.test(name))
    if (!fileContent) {
        return null
    }
    fileList = await getFileList(`${path}/${fileContent.name}`)
    return fileList.filter(({ is_dir }) => !is_dir).map(({ name }) => ({ name, path: `${path}/${fileContent.name}/${name}` }))
}

const scanMediaEpisode = async (path: string, episodeList: Array<Media.EpisodeContent> | undefined) => {
    const fileList = await getFileList(path, true)
    const episodeRegx = new RegExp('.*[第e](?<episodeIndex>[0-9]+(\.[0-9]+)?)[话話集]?.*\.(mp4|mkv|avi|mov|rmvb|webm|flv)$', 'i')
    const episodeMap = new Map(episodeList ? episodeList.map((item) => [item.episodeIndex, item]) : [])
    for (let index = 0, { length } = fileList; index < length; index++) {
        const fileContent = fileList[index]
        const { is_dir, name, size, modified } = fileContent
        if (is_dir || !episodeRegx.test(name)) {
            continue
        }
        const { groups } = episodeRegx.exec(name) || {}
        const episodeIndex = parseInt(groups?.['episodeIndex'] || '')
        episodeMap.set(episodeIndex, {
            ...episodeMap.get(episodeIndex) || { episodeIndex, fileName: name, subtitleList: [], size, lastUpdate: new Date(modified).getTime() },
            episodeIndex, fileName: name, size, lastUpdate: new Date(modified).getTime()
        })
    }

    episodeList = [...episodeMap.values()].sort((a, b) => a.episodeIndex - b.episodeIndex)
    const p = { max: 0, i: 0 }
    for (let index = 0, { length } = episodeList; index < length; index++) {
        const episodeContent = episodeList[index]
        const regx = new RegExp(`^${episodeContent.fileName.replace(/\.(mp4|mkv|avi|mov|rmvb|webm|flv)$/, '')}.*\.(vtt|srt|ass)$`)
        const subtitleList = fileList.filter(({ is_dir, name }) => !is_dir && regx.test(name)).map(({ name }) => ({ fileName: name }))
        episodeContent.subtitleList = subtitleList
        if (episodeContent.lastUpdate && episodeContent.lastUpdate > p.max) {
            p.max = episodeContent.lastUpdate
            p.i = index
        }
    }

    return { episodeList, lastUpdateInfo: episodeList[p.i] }
}

