export interface Config  {
    LISTEN_PORT: number
    MEDIA_LIST_PATH: string
    PROXY_CONFIG: {
        HOST: string
        PORT: number
    }
    ALIST_API_URL: string
    ALIST_API_TOKEN: string
    ALIST_MEDIA_PATH_LIST: string[]
    ALIST_USE_PROXY: boolean
    TMDB_API_TOKEN: string
    TMDB_USE_PROXY: boolean
    DANDANPLAY_USE_PROXY: boolean
}