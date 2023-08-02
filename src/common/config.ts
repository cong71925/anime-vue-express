import fs from 'fs'
import YAML from 'yaml'
import { Config } from '../types/config.js'
const CONFIG_PATH = './config/config.yaml'
if (!fs.existsSync(CONFIG_PATH)) {
    throw 'No config file!'
}
const config: Config = YAML.parse(fs.readFileSync(CONFIG_PATH, 'utf8'))
export default config
