import fs from 'fs'
import fetch from 'node-fetch'
import { logger } from '../../common/logger.js'
import { useAgent } from '../../common/agent.js'

const regxFileType = new RegExp('\.[^\.]+$')

type ImgStillSize = 'w92' | 'w185' | 'w300' | 'original'
type ImgPosterSize = 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original'

export const downloadImage = async (imagePath: string, savePath: string, fileName: string, size: ImgStillSize | ImgPosterSize = 'original', replace = false) => {
    if (!imagePath) {
        return undefined
    }
    if (!fs.existsSync(savePath)) {
        fs.mkdirSync(savePath, { recursive: true })
    }
    const fileType = regxFileType.exec(imagePath)?.[0] || ''
    const filePath = `${savePath}/${fileName}-${size}${fileType}`

    if (fs.existsSync(filePath) && !replace) {
        return filePath
    }
    const res = await fetch(`https://image.tmdb.org/t/p/${size}${imagePath}`, {
        method: 'get',
        agent: (url) => useAgent(url, 'tmdb')
    })

    if (!res.ok) {
        return undefined
    }

    if (!res.body) {
        return undefined
    }

    const writer = fs.createWriteStream(filePath)
    res.body.pipe(writer)

    const result = await new Promise<string | undefined>((resolve) => {
        writer.on('finish', () => {
            writer.close()
            writer.destroy()
            res.body?.unpipe()
            logger.info(`File save to: ${filePath}`)
            resolve(filePath)
        })
        writer.on('error', () => {
            writer.close()
            writer.destroy()
            res.body?.unpipe()
            logger.error(`File save error: ${filePath}`)
        })
    })

    return result
}