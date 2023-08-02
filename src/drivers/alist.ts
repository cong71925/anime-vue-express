import config from '../common/config.js'
import { useAgent } from '../common/agent.js'
import fetch from 'node-fetch'

const { ALIST_API_TOKEN, ALIST_API_URL } = config

export namespace AlistResponseData {
    export interface FileContent {
        name: string
        size: number
        is_dir: boolean
        modified: string
        sign: string
        thumb: ''
        type: ''
    }

    export interface FileDownloadContent extends FileContent {
        raw_url: string
        related: null
    }

    export interface GetFileListData {
        code: number
        message: string
        data: {
            total: number
            readme: string
            write: boolean
            provider: string
            content: Array<FileContent>
        } | null
    }

    export interface GetFileData {
        code: number
        data: FileDownloadContent | null
        message: string
    }

    export interface GetVideoPreviewData {
        code: number
        message: string
        data: VideoPreviewData | null
    }

    export interface VideoPreviewData {
        drive_id: string
        file_id: string
        meta: {
            duration: number
            height: number
            width: number
        }
        video_preview_play_info: {
            category: string
            live_transcoding_task_list: Array<TranscodingTaskData>
        }
    }

    interface TranscodingTaskData {
        stage: string
        status: string
        template_height: number
        template_width: number
        template_id: string
        template_name: string
        url: string
    }
}

export const getFileList = (path: string, refresh = false): Promise<Array<AlistResponseData.FileContent>> => new Promise((resolve, reject) => {
    fetch(`${ALIST_API_URL}/api/fs/list`, {
        method: 'post',
        agent: (url) => useAgent(url, 'alist'),
        headers: { authorization: ALIST_API_TOKEN, 'Content-Type': 'application/json' },
        body: JSON.stringify({ path, refresh }),
    }).then(async (res) => {
        if (!res.ok) {
            return reject(res.statusText)
        }
        const { code, data, message } = await res.json() as AlistResponseData.GetFileListData
        if (code !== 200 || !data) {
            return reject(message)
        }
        resolve(data.content)
    }).catch((error) => {
        reject(error)
    })
})

export const getFile = (path: string): Promise<AlistResponseData.FileDownloadContent> => new Promise((resolve, reject) => {
    fetch(`${ALIST_API_URL}/api/fs/get`, {
        method: 'post',
        agent: (url) => useAgent(url, 'alist'),
        headers: { authorization: ALIST_API_TOKEN, 'Content-Type': 'application/json' },
        body: JSON.stringify({ path }),
    }).then(async (res) => {
        if (!res.ok) {
            return reject(res.statusText)
        }
        const { code, data, message } = await res.json() as AlistResponseData.GetFileData
        if (code !== 200 || !data) {
            return reject(message)
        }
        resolve(data)
    }).catch((error) => {
        reject(error)
    })
})

export const getVideoPreview = (path: string): Promise<AlistResponseData.VideoPreviewData> => new Promise((resolve, reject) => {
    fetch(`${ALIST_API_URL}/api/fs/other`, {
        method: 'post',
        agent: (url) => useAgent(url, 'alist'),
        headers: { authorization: ALIST_API_TOKEN, 'Content-Type': 'application/json' },
        body: JSON.stringify({ path, method: 'video_preview' }),
    }).then(async (res) => {
        if (!res.ok) {
            return reject(res.statusText)
        }
        const { code, data, message } = await res.json() as AlistResponseData.GetVideoPreviewData
        if (code !== 200 || !data) {
            return reject(message)
        }
        resolve(data)
    }).catch((error) => {
        reject(error)
    })
})