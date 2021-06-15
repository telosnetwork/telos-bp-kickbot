const BPWatcher = require('./src/BPWatcher')
require('dotenv').config()

const telegramApiKey = process.env.TELEGRAM_API_KEY
const telegramChannel = process.env.TELEGRAM_CHANNEL
const missedBlockThresshold = parseInt(process.env.MISSED_BLOCK_ALERT_THRESHHOLD, 10) || 0
const rpc = process.env.RPC
const hyperion = process.env.HYPERION
const debug = process.env.DEBUG == "true"


;(async () => {
    let watcher = new BPWatcher(telegramApiKey, telegramChannel, rpc, hyperion)
    watcher.setDebug(debug)
    await watcher.init()
})()