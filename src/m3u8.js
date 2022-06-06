const fs = require('fs')
const { parse } = require('csv-parse/sync')
const path = require('path')

const file = path.join(__dirname, '../channels.csv')

const contents = fs.readFileSync(file, 'utf8')

const channels = parse(contents, {
  columns: true,
  skip_empty_lines: true
})

console.log(channels)

const public = path.join(__dirname, '../public')

fs.mkdirSync(public, { recursive: true })

const playlist = fs.createWriteStream(public+'/index.m3u8', { flags: 'w' })

playlist.write('#EXTM3U x-tvg-url="https://github.com/botallen/epg/releases/download/latest/epg.xml"')

for (const channel of channels){
    playlist.write(`

#EXTINF:-1 group-title="${channel.group}" tvg-language="${channel.language}" tvg-logo="${channel.logo}", ${channel.name}
https://hls.youtb.workers.dev/channel/${channel.youtube}.m3u8`)
}

playlist.end()
