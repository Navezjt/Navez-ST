const fs = require('fs') 
const { parse } = require('csv-parse/sync')
const { stringify } = require('csv-stringify/sync')
const path = require('path')
const axios = require('axios')

const getCache = async () => {
  const response = await axios.get('https://ythls-v2.onrender.com/cache')
  return response.data
}

(async () => {
  // read the channels from csv file
  const file = path.join(__dirname, '../channels.csv')
  const contents = fs.readFileSync(file, 'utf8')
  const channels = parse(contents, {
    columns: true,
    skip_empty_lines: true
  })

  // get channels from remote cache
  const cache = await getCache()

  // merge the channels from two sourcea
  cache.forEach(item => {
    if (item.name) {
      const youtube = item.url.replace('https://www.youtube.com/', '').replace('/live', '').replace('watch?v=', 'video/')

      const index = channels.findIndex((channel) => channel.youtube === youtube)
      const channel = channels[index]

      if (channel) {
        // existing channel

        // update logo
        if (item.logo && item.logo !== '' && channel.logo !== item.logo) {
          channel.logo = item.logo
          channel.updated = (new Date()).toISOString()
        }

        // update name
        if (item.name !== '' && channel.name !== item.name.trim()) {
          channel.name = item.name.trim()
          channel.updated = (new Date()).toISOString()
        }

        // remove video which is not live
        if (youtube.startsWith('video/') && !item.isLive) {
          channels.splice(index, 1)
        }
      } else {
        // add new channel if live
        if (item.isLive) {
          channels.push({
            name: item.name,
            group: '',
            language: '',
            youtube,
            logo: item.logo,
            updated: (new Date()).toISOString()
          })
        }
      }
    }
  })

  // sort channels alphabetically by their name
  channels.sort((a, b) => a.name.toLowerCase().trim().localeCompare(b.name.toLowerCase().trim()))

  const output = stringify(channels, { header: true })

  // console.log(output)

  fs.writeFileSync('channels.csv', output, { encoding: 'utf8', flag: 'w' })
})()
