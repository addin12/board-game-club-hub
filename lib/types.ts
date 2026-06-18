export interface BoardGame {
  id: string
  name: string
  yearPublished: number | null
  thumbnail: string
  image: string
  minPlayers: number
  maxPlayers: number
  minPlayTime: number
  maxPlayTime: number
  userRating: number | null
  communityRating: number
  bggRank: number | null
  numPlays: number
  // Enrichment from BGG's `thing` API (optional; present where we've fetched it)
  weight?: number | null // average complexity, 1 (light) – 5 (heavy)
  mechanics?: string[]
  designers?: string[]
}

// A community game carries the same fields as a BoardGame plus who owns it
// and its BGG categories (used by the /all and /session pages).
export interface CommunityGame extends BoardGame {
  categories: string[]
  owners: string[]
}

export type SortField = 'name' | 'userRating' | 'communityRating' | 'bggRank' | 'numPlays' | 'minPlayTime'
export type SortDirection = 'asc' | 'desc'

export interface FilterState {
  minPlayers: number | null
  maxPlayTime: number | null
  sortField: SortField
  sortDirection: SortDirection
}
