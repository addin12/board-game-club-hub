import { BoardGame } from './types'

// Minimal CSV parser: handles quoted fields, embedded commas/newlines, and "" escapes.
function parseCsvRows(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          inQuotes = false
        }
      } else {
        field += c
      }
    } else if (c === '"') {
      inQuotes = true
    } else if (c === ',') {
      row.push(field)
      field = ''
    } else if (c === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else if (c !== '\r') {
      field += c
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

/**
 * Parses a BoardGameGeek collection CSV export (the "Export → CSV" download)
 * into BoardGame[]. Keeps only owned items. Images are left empty — callers
 * can enrich them separately (BGG doesn't include image URLs in the export).
 */
export function parseBggCsv(text: string): BoardGame[] {
  const rows = parseCsvRows(text).filter((r) => r.length > 1)
  if (rows.length < 2) return []

  const header = rows[0].map((h) => h.trim().toLowerCase())
  const idx = (name: string) => header.indexOf(name)
  const col = {
    name: idx('objectname'),
    id: idx('objectid'),
    rating: idx('rating'),
    numplays: idx('numplays'),
    average: idx('average'),
    rank: idx('rank'),
    own: idx('own'),
    minplayers: idx('minplayers'),
    maxplayers: idx('maxplayers'),
    minplaytime: idx('minplaytime'),
    maxplaytime: idx('maxplaytime'),
    playingtime: idx('playingtime'),
    yearpublished: idx('yearpublished'),
  }
  if (col.name < 0 || col.id < 0) {
    throw new Error('This does not look like a BGG collection CSV export.')
  }

  const numAt = (r: string[], i: number) => {
    const n = parseFloat(r[i] ?? '')
    return Number.isFinite(n) ? n : 0
  }
  const intAt = (r: string[], i: number) => {
    const n = parseInt(r[i] ?? '', 10)
    return Number.isFinite(n) ? n : 0
  }

  const games: BoardGame[] = []
  for (let i = 1; i < rows.length; i++) {
    const r = rows[i]
    if (col.own >= 0 && r[col.own]?.trim() !== '1') continue

    const id = (r[col.id] ?? '').trim()
    const name = (r[col.name] ?? '').trim()
    if (!id || !name) continue

    const userRating = numAt(r, col.rating)
    const rank = intAt(r, col.rank)
    const maxPlayTime = intAt(r, col.maxplaytime) || (col.playingtime >= 0 ? intAt(r, col.playingtime) : 0)

    games.push({
      id,
      name,
      yearPublished: intAt(r, col.yearpublished) || null,
      thumbnail: '',
      image: '',
      minPlayers: intAt(r, col.minplayers) || 1,
      maxPlayers: intAt(r, col.maxplayers) || 1,
      minPlayTime: intAt(r, col.minplaytime) || 0,
      maxPlayTime,
      userRating: userRating > 0 ? userRating : null,
      communityRating: numAt(r, col.average),
      bggRank: rank > 0 ? rank : null,
      numPlays: intAt(r, col.numplays),
    })
  }
  return games
}
