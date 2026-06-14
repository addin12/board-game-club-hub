import { getCollectionData, CollectionError } from '@/lib/collection'

export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params

    // Validate username to prevent injection
    if (!username || !/^[a-zA-Z0-9_-]+$/.test(username)) {
      return Response.json({ error: 'Invalid username' }, { status: 400 })
    }

    const games = await getCollectionData(username)
    return Response.json(games)
  } catch (error) {
    if (error instanceof CollectionError) {
      return Response.json({ error: error.message }, { status: error.status })
    }
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Collection API error:', error)
    return Response.json({ error: message || 'Failed to fetch collection' }, { status: 500 })
  }
}
