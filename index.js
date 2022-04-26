const PORT = 5000
const axios = require('axios')
const cheerio = require('cheerio')
const express = require('express')

const app = express()

async function getData() {
  const data = []
  const url = 'https://readcomicsonline.ru/'

  await axios(url).then((response) => {
    const html_data = response.data
    const $ = cheerio.load(html_data)

    const selectedElement = 'li.list-group-item'
    $(selectedElement).each((parentIndex, parentElement) => {
      $(parentElement)
        .find('a.chart-title')
        .each((a, b) => {
          const endpoint = $(b)
            .attr('href')
            .replace('https://readcomicsonline.ru/comic/', '')
          data.push({
            index: parentIndex,
            text: $(b).text(), // get the text
            href: $(b).attr('href'),
            endpoint: endpoint, // get the href attribute
            // get the href attribute
          })
        })
      $(parentElement)
        .find('img')
        .each((a, b) => {
          const img = $(b).attr('src')
          data[parentIndex].thumb = img
          data[parentIndex].img = img.replace(
            'cover_thumb.jpg',
            'cover_250x350.jpg'
          )
        })
    })
  })
  return data
}

async function getChapter(endpoint_chapter) {
  const data = []
  const url = `https://readcomicsonline.ru/comic/${endpoint_chapter}`
  await axios(url).then((response) => {
    const html_data = response.data
    const $ = cheerio.load(html_data)

    const selectedElement = 'li.volume-0'
    $(selectedElement).each((parentIndex, parentElement) => {
      $(parentElement)
        .find('a')
        .each((a, b) => {
          const endpoint = $(b)
            .attr('href')
            .replace(`https://readcomicsonline.ru/comic/`, '')
          data.push({
            index: parentIndex,
            text: $(b).text(), // get the text
            href: $(b).attr('href'),
            endpoint: endpoint,
          })
        })
    })
  })
  return data
}

async function getImage(comic_name, endpoint) {
  const data = []
  const url = `https://readcomicsonline.ru/comic/${comic_name}/${endpoint}`
  await axios(url).then((response) => {
    const html_data = response.data
    const $ = cheerio.load(html_data)
    const selectedElement = '#all'

    $(selectedElement).each((parentIndex, parentElement) => {
      $(parentElement)
        .find('img')
        .each((a, b) => {
          data.push({
            index: parentIndex,
            image: $(b).attr('data-src'), // get the text
          })
        })
    })
  })
  return data
}

app.get('/api/komik', async (req, res) => {
  try {
    const data = await getData()
    return res.status(200).json({
      result: data,
    })
  } catch (err) {
    return res.status(500).json({
      err: err.toString(),
    })
  }
})

app.get('/api/chapters/:url', async (req, res) => {
  const url = req.params.url
  try {
    const data = await getChapter(url)
    return res.status(200).json({
      result: data,
    })
  } catch (err) {
    return res.status(500).json({
      err: err.toString(),
    })
  }
})

app.get('/api/read/:comic_name/:url', async (req, res) => {
  const url = req.params.url
  const comic_name = req.params.comic_name

  try {
    const data = await getImage(comic_name, url)
    return res.status(200).json({
      result: data,
    })
  } catch (err) {
    return res.status(500).json({
      err: err.toString(),
    })
  }
})

app.listen(PORT, () =>
  console.log(`The server is active and running on port ${PORT}`)
)

// let url = 'https://readcomicsonline.ru/'

// request(url, function (err, res, body) {
//   if (err && res.statusCode !== 200) throw err
//   const soup = cheerio.load(body)
//   const thumb = []
//   const comic_name = []

//   soup('li.list-group-item').each(function (a, b) {
//     soup(b)
//       .find('a.chart-title')
//       .each(function (c, d) {
//         comic_name.push(soup(d).text())
//       })
//     soup(b)
//       .find('a.chart-title')
//       .each(function (c, d) {
//         comic_name.push(soup(d).text())
//       })
//   })

//   console.info(comic_name)
// })
