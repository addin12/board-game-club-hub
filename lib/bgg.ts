import { XMLParser } from 'fast-xml-parser'
import { BoardGame } from './types'

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  isArray: (name) => name === 'item' || name === 'rank',
})

interface Rank {
  '@_name'?: string
  '@_value'?: string
}

// In collection XML, <name> carries a sortindex attribute, so the parser yields
// an object ({ '#text', '@_sortindex' }) rather than a plain string.
type XmlName = string | { '#text'?: string; '@_sortindex'?: string }

interface ParsedItem {
  '@_objectid': string
  name: XmlName
  thumbnail?: string
  image?: string
  yearpublished?: string
  numplays?: string
  stats?: {
    '@_minplayers'?: string
    '@_maxplayers'?: string
    '@_minplaytime'?: string
    '@_maxplaytime'?: string
    rating?: {
      '@_value'?: string
      average?: { '@_value'?: string }
      ranks?: { rank?: Rank[] | Rank }
    }
  }
}

interface ParsedCollection {
  items?: { item: ParsedItem | ParsedItem[] }
}

export function parseCollection(xml: string): BoardGame[] {
  const parsed = parser.parse(xml) as ParsedCollection

  if (!parsed.items || !parsed.items.item) {
    return []
  }

  const items = Array.isArray(parsed.items.item) ? parsed.items.item : [parsed.items.item]

  return items
    .map((item: ParsedItem) => {
      const stats = item.stats || {}
      const rating = stats.rating || {}
      const ranks = rating.ranks || {}
      const rankList = ranks.rank ? (Array.isArray(ranks.rank) ? ranks.rank : [ranks.rank]) : []
      const bggRank = rankList.find((r: Rank) => r?.['@_name'] === 'boardgame')

      let thumbnail = item.thumbnail || ''
      if (thumbnail.startsWith('//')) {
        thumbnail = 'https:' + thumbnail
      }

      let image = item.image || thumbnail
      if (image.startsWith('//')) {
        image = 'https:' + image
      }

      const userRatingStr = rating['@_value']
      const userRating = userRatingStr && userRatingStr !== 'N/A' ? parseFloat(userRatingStr) : null

      const bggRankValue = bggRank?.['@_value']
      const bggRankNum = bggRankValue && bggRankValue !== 'Not Ranked' ? parseInt(bggRankValue, 10) : null

      const name = typeof item.name === 'string' ? item.name : item.name?.['#text'] ?? ''

      return {
        id: String(item['@_objectid']),
        name,
        yearPublished: item.yearpublished ? parseInt(item.yearpublished, 10) : null,
        thumbnail,
        image,
        minPlayers: parseInt(stats['@_minplayers'] || '1', 10),
        maxPlayers: parseInt(stats['@_maxplayers'] || '1', 10),
        minPlayTime: parseInt(stats['@_minplaytime'] || '0', 10),
        maxPlayTime: parseInt(stats['@_maxplaytime'] || '0', 10),
        userRating,
        communityRating: parseFloat(rating.average?.['@_value'] || '0'),
        bggRank: bggRankNum,
        numPlays: parseInt(item.numplays || '0', 10),
      } as BoardGame
    })
    .filter((game: BoardGame) => game.id && game.name)
}
