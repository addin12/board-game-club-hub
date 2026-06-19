import { getSupabase } from './supabase'

// Proof-of-ownership for a BGG account, without passwords: the owner pastes a
// one-time code into their BGG profile "Web Address" field (only they can edit
// it), and we read it back via the public API to confirm. No OAuth exists on BGG.

const TABLE = 'verified_accounts'

const globalForVerify = globalThis as unknown as {
  __verify?: Map<string, { code: string; verified: boolean }>
}
const mem = globalForVerify.__verify ?? new Map<string, { code: string; verified: boolean }>()
globalForVerify.__verify = mem

const key = (username: string) => username.trim().toLowerCase()

function genCode(): string {
  // distinctive + high-entropy so nobody can guess what to place on a victim's profile
  return 'bbgc-verify-' + crypto.randomUUID().replace(/-/g, '').slice(0, 10)
}

/** Pure: does the profile's Web Address contain the issued code? (case-insensitive) */
export function codeMatches(webaddress: string, code: string): boolean {
  return !!webaddress && !!code && webaddress.toLowerCase().includes(code.toLowerCase())
}

/** Read a BGG user's profile "Web Address" via the authenticated XML API. */
export async function fetchWebAddress(username: string): Promise<string> {
  const headers: Record<string, string> = { 'User-Agent': 'BBGC/1.0 (board-game-club-hub)' }
  const token = process.env.BGG_API_TOKEN
  if (token) headers.Authorization = `Bearer ${token}`
  const res = await fetch(`https://boardgamegeek.com/xmlapi2/user?name=${encodeURIComponent(username)}`, { headers })
  if (!res.ok) throw new Error(`BGG user lookup failed (${res.status})`)
  const xml = await res.text()
  return xml.match(/<webaddress value="([^"]*)"/)?.[1] ?? ''
}

/** Issue (or reissue) a verification code for a username. */
export async function startVerification(username: string): Promise<string> {
  const code = genCode()
  const k = key(username)
  const sb = getSupabase()
  if (!sb) {
    mem.set(k, { code, verified: false })
    return code
  }
  await sb.from(TABLE).upsert({ username: k, code, verified: false, updated_at: new Date().toISOString() })
  return code
}

/** Confirm ownership: read the Web Address and match the issued code. */
export async function checkVerification(username: string): Promise<boolean> {
  const k = key(username)
  const sb = getSupabase()

  let code: string | undefined
  if (!sb) {
    const entry = mem.get(k)
    if (entry?.verified) return true
    code = entry?.code
  } else {
    const { data } = await sb.from(TABLE).select('code, verified').eq('username', k).maybeSingle()
    if (data?.verified) return true
    code = data?.code ?? undefined
  }
  if (!code) return false

  const web = await fetchWebAddress(username)
  if (!codeMatches(web, code)) return false

  if (!sb) mem.set(k, { code, verified: true })
  else await sb.from(TABLE).update({ verified: true }).eq('username', k)
  return true
}

/** Has this username been verified as owned? */
export async function isVerified(username: string): Promise<boolean> {
  const k = key(username)
  const sb = getSupabase()
  if (!sb) return !!mem.get(k)?.verified
  const { data } = await sb.from(TABLE).select('verified').eq('username', k).maybeSingle()
  return !!data?.verified
}
