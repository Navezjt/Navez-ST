const fs = require('fs')
const { parse } = require('csv-parse/sync')
const { stringify } = require('csv-stringify/sync')
const path = require('path')
const axios = require('axios')

const getCache = async () => {
  const response = await axios.get('https://ythls.onrender.com/cache')
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

  // console.log(channels)

  // get channels from remote cache
  const cache = await getCache()

  // console.log(cache)

  // merge the channels from two sourcea
  cache.forEach(item => {
    if (item.name) {
      const youtube = item.url.replace('https://www.youtube.com/', '').replace('/live', '').replace('watch?v=', 'video/')

      const channel = channels.find((channel) => channel.youtube === youtube)

      if (channel) {
        if (item.logo && item.logo !== '' && channel.logo !== item.logo) {
          // console.log('Updating logo:', item.name)
          channel.logo = item.logo
          channel.updated = (new Date()).toISOString()
        }
      } else {
        // console.log('Adding channel:', item.name)
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
  })

  // console.log(channels)

  // sort channels alphabetically by their name
  channels.sort((a, b) => a.name.toLowerCase().trim().localeCompare(b.name.toLowerCase().trim()))

  const output = stringify(channels, { header: true })

  // console.log(output)

  fs.writeFileSync('channels.csv', output, { encoding: 'utf8', flag: 'w' })
})()
