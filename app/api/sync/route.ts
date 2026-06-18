import { getCollectionData, CollectionError } from '@/lib/collection'
import { saveMemberCollection } from '@/lib/collections'

export const dynamic = 'force-dynamic'

// Pull a member's collection live from BoardGameGeek and save it to the
// community in one step. The BGG token stays server-side (used by getCollectionData).
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const { username, member } = body ?? {}

    if (!username || typeof username !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(username)) {
      return Response.json({ error: 'Enter a valid BoardGameGeek username (letters, numbers, - and _).' }, { status: 400 })
    }
    const name = (typeof member === 'string' && member.trim() ? member.trim() : username).slice(0, 40)

    let games
    try {
      games = await getCollectionData(username)
    } catch (e) {
      if (e instanceof CollectionError) {
        const status = e.status === 404 ? 404 : 502
        const msg = e.status === 404 ? 'No public collection found for that username.' : e.message
        return Response.json({ error: msg }, { status })
      }
      throw e
    }

    if (!games.length) {
      return Response.json({ error: 'That collection has no owned games to import.' }, { status: 422 })
    }

    const count = await saveMemberCollection(name, games)
    return Response.json({ member: name, username, count, games }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/sync]', error)
    return Response.json({ error: 'Could not sync the collection. Please try again.' }, { status: 500 })
  }
}
