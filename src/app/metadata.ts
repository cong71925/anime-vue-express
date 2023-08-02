import { getMediaList, setMediaList } from '../common/mediaList.js'
import { logger } from '../common/logger.js'
import * as Tmdb from '../drivers/tmdb/index.js'
import { MediaContent, SeasonContent, EpisodeContent } from '../types/media.js'

export const getMediaMetadata = async () => {
    const mediaList = getMediaList()
    for (let i = 0; i < mediaList.length; i++) {
        const mediaContent = mediaList[i]
        if (!mediaContent.tmdbId) {
            const data = await Tmdb.Search.searchTV({ query: mediaContent.folderName, language: 'zh-CN' })
            if (data && data.results && data.results.length && data.results[0]) {
                const { name, id, overview } = data.results[0]
                mediaContent.name = name
                mediaContent.tmdbId = id
                mediaContent.overview = overview
            }
        }
        mediaList[i] = await getTvSeriesMetadata(mediaContent, false)
    }
    setMediaList(mediaList)
    logger.info('Scan Media TMDB id finish')
}

const getTvSeriesMetadata = async (mediaContent: MediaContent, replace = false): Promise<MediaContent> => {
    const { tmdbId, overview, name, id } = mediaContent
    if (!tmdbId) {
        return mediaContent
    }

    const tvSeriesMetaData = await Tmdb.TvSeries.getTvSeries({ series_id: tmdbId, language: 'zh-CN' })
    const imgPathOriginal = await Tmdb.Image.downloadImage(tvSeriesMetaData?.poster_path || '', `./public/resources/${id}`, 'poster', 'original', replace)
    const imgPathLg = await Tmdb.Image.downloadImage(tvSeriesMetaData?.poster_path || '', `./public/resources/${id}`, 'poster', 'w500', replace)
    const imgPathMd = await Tmdb.Image.downloadImage(tvSeriesMetaData?.poster_path || '', `./public/resources/${id}`, 'poster', 'w342', replace)
    const imgPathSm = await Tmdb.Image.downloadImage(tvSeriesMetaData?.poster_path || '', `./public/resources/${id}`, 'poster', 'w185', replace)

    if (!mediaContent.seasonList) {
        return mediaContent
    }

    const seasonList: Array<SeasonContent> = []
    for (let index = 0, { length } = mediaContent.seasonList; index < length; index++) {
        seasonList[index] = await getSeasonMetaData(mediaContent.seasonList[index], id, tmdbId, replace)
    }

    return {
        ...mediaContent,
        imgPosterPath: {
            original: imgPathOriginal,
            lg: imgPathLg,
            md: imgPathMd,
            sm: imgPathSm
        },
        overview: replace ? tvSeriesMetaData?.overview : overview,
        name: replace ? tvSeriesMetaData?.name : name,
        seasonList,
    }
}

const getSeasonMetaData = async (seasonContent: SeasonContent, id: number, tmdbId: number, replace = false): Promise<SeasonContent> => {
    const { seasonIndex, name, overview } = seasonContent
    if (!seasonContent.episodeList) {
        return seasonContent
    }
    const seasonMetaData = await Tmdb.TvSeason.getTvSeason({ series_id: tmdbId, season_number: seasonIndex })
    const episodeList: Array<EpisodeContent> = []
    for (let index = 0, { length } = seasonContent.episodeList; index < length; index++) {
        // episodeList[index] = seasonContent.episodeList[index]
        episodeList[index] = await getEpisodeMetaData(seasonContent.episodeList[index], seasonContent.seasonIndex, id, tmdbId, replace)
    }
    const imgPathOriginal = await Tmdb.Image.downloadImage(seasonMetaData?.poster_path || '', `./public/resources/${id}`, `S${seasonIndex}-poster`, 'original', replace)
    const imgPathLg = await Tmdb.Image.downloadImage(seasonMetaData?.poster_path || '', `./public/resources/${id}`, `S${seasonIndex}-poster`, 'w500', replace)
    const imgPathMd = await Tmdb.Image.downloadImage(seasonMetaData?.poster_path || '', `./public/resources/${id}`, `S${seasonIndex}-poster`, 'w342', replace)
    const imgPathSm = await Tmdb.Image.downloadImage(seasonMetaData?.poster_path || '', `./public/resources/${id}`, `S${seasonIndex}-poster`, 'w185', replace)
    return {
        ...seasonContent,
        imgPosterPath: {
            original: imgPathOriginal,
            lg: imgPathLg,
            md: imgPathMd,
            sm: imgPathSm
        },
        name: replace ? seasonMetaData?.name : name,
        overview: replace ? seasonMetaData?.overview : overview,
        episodeList
    }
}


const getEpisodeMetaData = async (episodeContent: EpisodeContent, seasonIndex: number, id: number, tmdbId: number, replace = false): Promise<EpisodeContent> => {
    const { episodeIndex, name, overview, imgStillPath } = episodeContent
    if (!replace && name && overview && imgStillPath) {
        return episodeContent
    }
    const episodeMetaData = await Tmdb.TvEpisode.getTvEpisode({ series_id: tmdbId, season_number: seasonIndex, episode_number: episodeIndex })    
    const imgPathOriginal = await Tmdb.Image.downloadImage(episodeMetaData?.still_path || '', `./public/resources/${id}`, `S${seasonIndex}E${episodeIndex}-still`, 'original', replace)
    const imgPathLg = await Tmdb.Image.downloadImage(episodeMetaData?.still_path || '', `./public/resources/${id}`, `S${seasonIndex}E${episodeIndex}-still`, 'w300', replace)
    const imgPathMd = await Tmdb.Image.downloadImage(episodeMetaData?.still_path || '', `./public/resources/${id}`, `S${seasonIndex}E${episodeIndex}-still`, 'w185', replace)
    const imgPathSm = await Tmdb.Image.downloadImage(episodeMetaData?.still_path || '', `./public/resources/${id}`, `S${seasonIndex}E${episodeIndex}-still`, 'w92', replace)
    logger.info('Get episode metadata finish')
    return {
        ...episodeContent,
        imgStillPath: {
            original: imgPathOriginal,
            lg: imgPathLg,
            md: imgPathMd,
            sm: imgPathSm
        },
        name: episodeMetaData?.name,
        overview: episodeMetaData?.overview,
        tmdbId: episodeMetaData?.id
    }
}


// const resetEpisodeMetaData = async (name: string, seasonIndex: number, episodeIndex: number): Promise<void> => {
//     const mediaList = getMediaList()
//     const mediaContent = mediaList.find((item) => item.name === name)
//     if (!mediaContent || !mediaContent.tmdbId || !mediaContent.seasonList) {
//         return
//     }
//     const seasonContent = mediaContent.seasonList.find((item) => item.seasonIndex === seasonIndex)
//     if (!seasonContent || !seasonContent.episodeList) {
//         return
//     }
//     const episodeContent = seasonContent.episodeList.find((item) => item.episodeIndex === episodeIndex)
//     if (!episodeContent) {
//         return
//     }

//     const episodeMetaData = await Tmdb.TvEpisode.getTvSeason({ series_id: mediaContent.tmdbId, season_number: seasonIndex, episode_number: episodeIndex })

//     episodeContent.name = episodeMetaData.name
//     episodeContent.overview = episodeMetaData.overview
//     episodeContent.tmdbId = episodeMetaData.id

//     Tmdb.Image.downloadImage(episodeMetaData.still_path || '', `./public/resources/${name}`, `S${seasonIndex}E${episodeIndex}-still`, 'original', true)
    

//     await setMediaList(mediaList)
// }


