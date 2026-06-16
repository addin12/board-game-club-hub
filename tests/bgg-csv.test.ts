import { describe, it, expect } from 'vitest'
import { parseBggCsv } from '@/lib/bgg-csv'

// A trimmed BGG "Export → CSV" sample: header + an owned game, a rated game,
// an unranked game, and a not-owned row (which must be skipped).
const csv = `objectname,objectid,rating,numplays,weight,own,fortrade,want,wanttobuy,wanttoplay,prevowned,preordered,wishlist,wishlistpriority,wishlistcomment,comment,conditiontext,haspartslist,wantpartslist,collid,baverage,average,avgweight,rank,numowned,objecttype,originalname,minplayers,maxplayers,playingtime,maxplaytime,minplaytime,yearpublished
"Azul","230802","0","0","0","1","0","0","0","0","0","0","0","3","","","","","","136606086","7.60511","7.71423","1.7719","99","184622","thing","Azul","2","4","45","45","30","2017"
"Flip 7","420087","8","2","0","1","0","0","0","0","0","0","0","3","","","","","","136068769","6.98949","7.21613","1.0319","515","51530","thing","Flip 7","3","18","20","20","20","2025"
"Kata Emak","447733","0","0","0","1","0","0","0","0","0","0","0","3","","","","","","141172440","0","8","0","0","9","thing","Kata Emak","2","6","25","25","15","2019"
"Not Mine","999","0","0","0","0","0","0","0","0","0","0","0","3","","","","","","1","0","7","0","100","5","thing","Not Mine","2","4","30","30","30","2020"`

describe('parseBggCsv', () => {
  const games = parseBggCsv(csv)

  it('keeps only owned games (skips own=0)', () => {
    expect(games).toHaveLength(3)
    expect(games.some((g) => g.name === 'Not Mine')).toBe(false)
  })

  it('maps core fields', () => {
    const azul = games.find((g) => g.id === '230802')!
    expect(azul.name).toBe('Azul')
    expect(azul.yearPublished).toBe(2017)
    expect(azul.minPlayers).toBe(2)
    expect(azul.maxPlayers).toBe(4)
    expect(azul.maxPlayTime).toBe(45)
    expect(azul.communityRating).toBeCloseTo(7.71423)
    expect(azul.bggRank).toBe(99)
  })

  it('keeps the user rating when set, null otherwise', () => {
    expect(games.find((g) => g.id === '420087')!.userRating).toBe(8)
    expect(games.find((g) => g.id === '230802')!.userRating).toBeNull()
  })

  it('treats rank 0 as unranked (null)', () => {
    expect(games.find((g) => g.id === '447733')!.bggRank).toBeNull()
  })

  it('throws on a non-BGG csv', () => {
    expect(() => parseBggCsv('a,b,c\n1,2,3')).toThrow()
  })
})
