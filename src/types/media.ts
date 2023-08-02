export interface MediaContent {
    id: number
    folderName: string
    folderPath: string
    seasonList: SeasonContent[]
    imgPosterPath?: {
        original?: string
        lg?: string
        md?: string
        sm?: string
    },
    imgStillPath?: {
        original?: string
        lg?: string
        md?: string
        sm?: string
    },
    name?: string
    tmdbId?: number
    overview?: string
    lastUpdateInfo?: {
        lastUpdate?: number
        seasonIndex?: number
        episodeIndex?: number
    }
}


export interface SeasonContent {
    seasonIndex: number
    folderName: string
    episodeList: EpisodeContent[]
    imgPosterPath?: {
        original?: string
        lg?: string
        md?: string
        sm?: string
    },
    imgStillPath?: {
        original?: string
        lg?: string
        md?: string
        sm?: string
    },
    name?: string
    overview?: string
    fonts?: {
        name: string
        path: string
    }[]
}

export interface EpisodeContent {
    episodeIndex: number
    fileName: string
    imgPosterPath?: {
        original?: string
        lg?: string
        md?: string
        sm?: string
    },
    imgStillPath?: {
        original?: string
        lg?: string
        md?: string
        sm?: string
    },
    lastUpdate?: number
    subtitleList?: SubtitleContent[]
    name?: string
    overview?: string
    tmdbId?: number
    size?: number
    danmakuId?: number
    hash?: string
    isMatched?: boolean
}

export interface SubtitleContent {
    fileName: string
}