import { describe, it, expect } from 'vitest'
import { parseCollection } from '@/lib/bgg'

const xml = `<?xml version="1.0"?>
<items>
  <item objectid="13">
    <name>Catan</name>
    <yearpublished>1995</yearpublished>
    <thumbnail>//cf.geekdo-images.com/thumb.jpg</thumbnail>
    <image>//cf.geekdo-images.com/img.jpg</image>
    <stats minplayers="3" maxplayers="4" minplaytime="60" maxplaytime="90">
      <rating value="8.5">
        <average value="7.2"/>
        <ranks>
          <rank name="boardgame" value="241"/>
        </ranks>
      </rating>
    </stats>
    <numplays>12</numplays>
  </item>
  <item objectid="999">
    <name>Unranked Game</name>
    <stats minplayers="1" maxplayers="5" minplaytime="20" maxplaytime="30">
      <rating value="N/A">
        <average value="0"/>
        <ranks>
          <rank name="boardgame" value="Not Ranked"/>
        </ranks>
      </rating>
    </stats>
  </item>
</items>`

describe('parseCollection', () => {
  const games = parseCollection(xml)

  it('parses every item', () => {
    expect(games).toHaveLength(2)
  })

  it('maps the first game correctly', () => {
    const g = games[0]
    expect(g.id).toBe('13')
    expect(g.name).toBe('Catan')
    expect(g.yearPublished).toBe(1995)
    expect(g.minPlayers).toBe(3)
    expect(g.maxPlayers).toBe(4)
    expect(g.minPlayTime).toBe(60)
    expect(g.maxPlayTime).toBe(90)
    expect(g.userRating).toBe(8.5)
    expect(g.communityRating).toBeCloseTo(7.2)
    expect(g.bggRank).toBe(241)
    expect(g.numPlays).toBe(12)
  })

  it('upgrades protocol-relative image URLs to https', () => {
    expect(games[0].thumbnail.startsWith('https://')).toBe(true)
  })

  it('treats "N/A" rating and "Not Ranked" as null', () => {
    const g = games[1]
    expect(g.userRating).toBeNull()
    expect(g.bggRank).toBeNull()
    expect(g.numPlays).toBe(0)
  })

  it('returns an empty array for an empty collection', () => {
    expect(parseCollection('<items></items>')).toEqual([])
  })

  // The live collection endpoint emits <name sortindex="1">…</name>, so the
  // parser yields an object for `name` rather than a string. Regression guard.
  it('reads the name when it carries a sortindex attribute', () => {
    const live = `<?xml version="1.0"?>
<items>
  <item objectid="230802">
    <name sortindex="1">Azul</name>
    <yearpublished>2017</yearpublished>
    <stats minplayers="2" maxplayers="4" minplaytime="30" maxplaytime="45">
      <rating value="N/A"><average value="7.71"/><ranks><rank name="boardgame" value="99"/></ranks></rating>
    </stats>
    <numplays>0</numplays>
  </item>
</items>`
    const [g] = parseCollection(live)
    expect(g.name).toBe('Azul')
    expect(g.id).toBe('230802')
    expect(g.bggRank).toBe(99)
  })
})
