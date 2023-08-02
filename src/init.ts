import { Express } from 'express'
import { scheduleJob } from 'node-schedule'
import { scanMedia } from './app/scaner.js'
import { getMediaMetadata } from './app/metadata.js'
import { scanDanmukuId } from './app/danmaku.js'

export const init = (app: Express): void => {
    const job = scheduleJob('scanner', '0 */4 * * * ?', async () => {
        await scanMedia()
        await getMediaMetadata()
        await scanDanmukuId()
    })
}