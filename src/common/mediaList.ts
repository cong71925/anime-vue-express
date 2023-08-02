import fs from 'fs'
import YAML from 'yaml'
import * as Media from '../types/media.js'
import config from './config.js'

const MEDIA_LIST_PATH = config.MEDIA_LIST_PATH

let mediaList: Array<Media.MediaContent> = fs.existsSync(MEDIA_LIST_PATH) ? YAML.parse(fs.readFileSync(MEDIA_LIST_PATH, 'utf8')) : []

let mediaMap = new Map(mediaList.map(item => [item.id, item]))
let seasonMap = new Map(mediaList.map((item) => item.seasonList.map((season): [string, Media.SeasonContent] => [`${item.id}_${season.seasonIndex}`, season])).flat(1))
let episodeMap = new Map(mediaList.map((item) => item.seasonList.map((season) => season.episodeList.map((episode): [string, Media.EpisodeContent] => [`${item.id}_${season.seasonIndex}_${episode.episodeIndex}`, episode]))).flat(2))

export const getMediaList = (): Array<Media.MediaContent> => mediaList
export const getMediaMap = () => mediaMap
export const getSeasonMap = () => seasonMap
export const getEpisodeMap = () => episodeMap

export const resetMediaList = () => {
    mediaList = fs.existsSync(MEDIA_LIST_PATH) ? YAML.parse(fs.readFileSync(MEDIA_LIST_PATH, 'utf8')) : []
}

export const setMediaList = (payload: Array<Media.MediaContent>) => {
    fs.writeFileSync(MEDIA_LIST_PATH, YAML.stringify(payload))
    resetMediaList()
    mediaMap.clear()
    seasonMap.clear()
    episodeMap.clear()
    mediaMap = new Map(mediaList.map(item => [item.id, item]))
    seasonMap = new Map(mediaList.map((item) => item.seasonList.map((season): [string, Media.SeasonContent] => [`${item.id}_${season.seasonIndex}`, season])).flat(1))
    episodeMap = new Map(mediaList.map((item) => item.seasonList.map((season) => season.episodeList.map((episode): [string, Media.EpisodeContent] => [`${item.id}_${season.seasonIndex}_${episode.episodeIndex}`, episode]))).flat(2))
    
}