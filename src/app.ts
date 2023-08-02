import express from 'express'
import { Request, Response, NextFunction } from 'express'
import 'express-async-errors'
import { logger } from './common/logger.js'
import { getImg, getVideoList, getMedia, getSeason, getLastUpdateMediaInfo, getVideoPreviewData, redirectSubtitleUrl, getEpisode, redirectVideoViewUrl, redirectFontUrl } from './api/video.js'
import { getDanmaku } from './api/danmaku.js'
import path from 'path'
import { init } from './init.js'
import { fileURLToPath } from 'url'
import config from './common/config.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const app = express()
init(app)

app.get('/api/getVideoList', getVideoList)
app.get('/api/getVideoPreviewData', getVideoPreviewData)
app.get('/api/getSeason', getSeason)
app.get('/api/getEpisode', getEpisode)
app.get('/api/getMedia', getMedia)
app.get('/api/getDanmaku', getDanmaku)
app.get('/api/getLastUpdateMediaInfo', getLastUpdateMediaInfo)
app.get('/api/redirectVideoViewUrl', redirectVideoViewUrl)
app.get('/api/redirectSubtitleUrl', redirectSubtitleUrl)
app.get('/api/redirectFontUrl', redirectFontUrl)
app.get('/api/getImg', getImg)

app.use(express.static(path.join(__dirname, '../public/dist')))
app.use('*', express.static(path.join(__dirname, '../public/dist/index.html')))

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    logger.error(err)
})

process.on('uncaughtException', (err) => logger.error(err))
process.on('unhandledRejection', (err) => logger.error(err))
app.listen(config.LISTEN_PORT, () => logger.info(`listen to 0.0.0.0:3000`))
