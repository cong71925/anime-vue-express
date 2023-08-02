import http from 'http'
import config from '../common/config.js'
import { HttpsProxyAgent } from 'https-proxy-agent'
const { PROXY_CONFIG, TMDB_USE_PROXY, ALIST_USE_PROXY } = config

export const HttpAgent = new http.Agent({ host: PROXY_CONFIG.HOST, port: PROXY_CONFIG.PORT, keepAlive: true })
export const HttpsAgent = new HttpsProxyAgent(`http://${PROXY_CONFIG.HOST}:${PROXY_CONFIG.PORT}`, { keepAlive: true })

const selectAgent = (parsedUrl: URL) => parsedUrl.protocol === 'http:' ? HttpAgent : HttpsAgent

export const useAgent = (parsedUrl: URL, type: 'alist' | 'tmdb') => {
    switch (type) {
        case 'alist':
            if (!ALIST_USE_PROXY) {
                return undefined
            }
            return selectAgent(parsedUrl)
        case 'tmdb':
            if (!TMDB_USE_PROXY) {
                return undefined
            }
            return selectAgent(parsedUrl)
        default: return undefined
    }
}