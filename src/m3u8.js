const fs = require('fs')
const { parse } = require('csv-parse/sync')
const path = require('path')

// read the channels from csv file
const file = path.join(__dirname, '../channels.csv')
const contents = fs.readFileSync(file, 'utf8')
const channels = parse(contents, {
  columns: true,
  skip_empty_lines: true
})

// sort channels alphabetically by their name
channels.sort((a, b) => {
  if (a.name.toLowerCase() > b.name.toLowerCase()) return 1
  if (a.name.toLowerCase() < b.name.toLowerCase()) return -1
  return 0
})

// write playlist to m3u8 file
const dist = path.join(__dirname, '../dist')
fs.mkdirSync(dist, { recursive: true })
const playlist = fs.createWriteStream(dist + '/index.m3u8', { flags: 'w' })

playlist.write('#EXTM3U x-tvg-url="https://github.com/botallen/epg/releases/download/latest/epg.xml"')

for (const channel of channels) {
  playlist.write(`

#EXTINF:-1 group-title="${channel.group}" tvg-language="${channel.language}" tvg-logo="${channel.logo}", ${channel.name}
https://ythls.onrender.com/${channel.youtube}.m3u8`)
}

playlist.end()
