import { startVerification, checkVerification } from '@/lib/verify'

export const dynamic = 'force-dynamic'

// Proof-of-ownership flow: { action: 'start' } issues a code to paste into the
// BGG profile Web Address; { action: 'check' } reads it back and verifies.
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}))
    const { username, action } = body ?? {}

    if (!username || typeof username !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(username)) {
      return Response.json({ error: 'Enter a valid BoardGameGeek username.' }, { status: 400 })
    }

    if (action === 'start') {
      const code = await startVerification(username)
      return Response.json({ code })
    }
    if (action === 'check') {
      const verified = await checkVerification(username)
      return Response.json({ verified })
    }
    return Response.json({ error: 'Unknown action.' }, { status: 400 })
  } catch (error) {
    console.error('[POST /api/verify]', error)
    return Response.json({ error: 'Could not reach BoardGameGeek to verify. Try again.' }, { status: 502 })
  }
}
