import fetch from 'node-fetch'
import CryptoJSW from '@originjs/crypto-js-wasm'

await CryptoJSW.algo.MD5.loadWasm()
const max = 16 * 1024 * 1024
const md5 = new CryptoJSW.algo.MD5()

export const getMD5 = (url) => new Promise((resolve, reject) => {
    fetch(url).then(async (res) => {
        let isReaded = 0
        if (!res.ok) {
            return reject(null)
        }
        if (!res.body) {
            return reject(null)
        }
        res.body.on('readable', () => {
            let chunk
            while (null !== (chunk = res.body?.read(64))) {
                md5.update(new CryptoJSW.lib.WordArray(chunk))
                isReaded = isReaded + chunk.byteLength
                if (chunk.byteLength + isReaded > max) {
                    res.body?.destroy()
                    break
                }
            }

        })
        res.body?.on('end', () => {
            res.body.destroy()
            const result = md5.finalize().toString()
            md5.reset()
            resolve(result)
        })

        res.body?.on('close', () => {
            const result = md5.finalize().toString()
            md5.reset()
            resolve(result)
        })
        
    })
})
