import { chromium } from 'playwright'
import { writeFileSync } from 'fs'

const USERNAME = process.argv[2] || 'Deedeen'
const URL = `https://boardgamegeek.com/collection/user/${USERNAME}?objecttype=thing&ff=1&subtype=boardgame`

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({
  userAgent:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
})

// Capture any JSON the Angular app loads for the collection
const captured = []
page.on('response', async (res) => {
  const url = res.url()
  if (url.includes('/api/collections') || url.includes('/api/geekitem') || url.includes('collectionitems')) {
    try {
      const json = await res.json()
      captured.push({ url, json })
      console.log(`[captured] ${url} (status ${res.status()})`)
    } catch {
      /* not json */
    }
  }
})

console.log(`Loading ${URL} ...`)
await page.goto(URL, { waitUntil: 'networkidle', timeout: 60000 })

// Give Angular a moment to finish rendering the table
await page.waitForTimeout(4000)

// Scrape the rendered DOM table as a fallback / primary source
const games = await page.evaluate(() => {
  const rows = Array.from(document.querySelectorAll('tr[id^="row_"]'))
  return rows.map((row) => {
    const nameEl = row.querySelector('.collection_objectname a, a.primary')
    const link = nameEl?.getAttribute('href') || ''
    const idMatch = link.match(/\/boardgame\/(\d+)/)
    const yearEl = row.querySelector('.smallerfont, .collection_year')
    const thumbImg = row.querySelector('.collection_thumbnail img, td.collection_thumbnail img')

    // rating cells
    const cellText = (sel) => row.querySelector(sel)?.textContent?.trim() || ''

    return {
      id: idMatch ? idMatch[1] : '',
      name: nameEl?.textContent?.trim() || '',
      yearRaw: yearEl?.textContent?.trim() || '',
      thumbnail: thumbImg?.getAttribute('src') || '',
      userRatingRaw: cellText('.collection_rating'),
      communityRatingRaw: cellText('.collection_bggrating'),
    }
  })
})

console.log(`\nDOM rows scraped: ${games.length}`)
console.log(JSON.stringify(games.slice(0, 3), null, 2))

writeFileSync('scripts/scraped-raw.json', JSON.stringify({ captured, games }, null, 2))
console.log('\nSaved raw output to scripts/scraped-raw.json')

// Save full HTML for inspection if DOM scrape came up empty
if (games.length === 0) {
  const html = await page.content()
  writeFileSync('scripts/rendered.html', html)
  console.log('DOM empty — saved rendered.html for inspection')
}

await browser.close()
