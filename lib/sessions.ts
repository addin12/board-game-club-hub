import { getSupabase } from './supabase'

export type RsvpStatus = 'in' | 'out'

export interface GameRef {
  id: string
  name: string
  thumbnail: string
}

export interface GameSession {
  id: string
  date: string // ISO datetime when the group will play
  description: string
  host: string // member who called the session
  players: string[] // proposed table (from the session builder)
  game: GameRef | null // optional locked-in game
  rsvps: Record<string, RsvpStatus>
  createdAt: number
}

export interface CreateSessionInput {
  date: string
  description: string
  host: string
  players: string[]
  game?: GameRef | null
}

const TABLE = 'sessions'

// ---------- in-memory fallback (survives HMR via globalThis) ----------
const globalForSessions = globalThis as unknown as { __sessions?: Map<string, GameSession> }
const memStore = globalForSessions.__sessions ?? new Map<string, GameSession>()
globalForSessions.__sessions = memStore

function isUpcoming(s: GameSession): boolean {
  // keep sessions visible until the end of their day
  const end = new Date(s.date)
  end.setHours(23, 59, 59, 999)
  return end.getTime() >= Date.now()
}

function byDateAsc(a: GameSession, b: GameSession): number {
  return new Date(a.date).getTime() - new Date(b.date).getTime()
}

// ---------- Supabase row mapping ----------
interface SessionRow {
  id: string
  date: string
  description: string | null
  host: string
  players: string[] | null
  game: GameRef | null
  rsvps: Record<string, RsvpStatus> | null
  created_at: string
}

function rowToSession(row: SessionRow): GameSession {
  return {
    id: row.id,
    date: new Date(row.date).toISOString(),
    description: row.description ?? '',
    host: row.host,
    players: row.players ?? [],
    game: row.game ?? null,
    rsvps: row.rsvps ?? {},
    createdAt: new Date(row.created_at).getTime(),
  }
}

// ---------- public API (auto-selects Supabase or in-memory) ----------

export async function listSessions(): Promise<GameSession[]> {
  const sb = getSupabase()
  if (!sb) {
    return Array.from(memStore.values()).filter(isUpcoming).sort(byDateAsc)
  }

  const { data, error } = await sb.from(TABLE).select('*').order('date', { ascending: true })
  if (error) throw new Error(error.message)
  return (data as SessionRow[]).map(rowToSession).filter(isUpcoming)
}

export async function createSession(input: CreateSessionInput): Promise<GameSession> {
  const base = {
    date: new Date(input.date).toISOString(),
    description: input.description.trim(),
    host: input.host,
    players: input.players,
    game: input.game ?? null,
    rsvps: { [input.host]: 'in' as RsvpStatus }, // the host is in by default
  }

  const sb = getSupabase()
  if (!sb) {
    const full: GameSession = { id: crypto.randomUUID(), ...base, createdAt: Date.now() }
    memStore.set(full.id, full)
    return full
  }

  const { data, error } = await sb.from(TABLE).insert(base).select().single()
  if (error) throw new Error(error.message)
  return rowToSession(data as SessionRow)
}

export async function setRsvp(
  id: string,
  name: string,
  status: RsvpStatus | 'clear'
): Promise<GameSession | null> {
  const sb = getSupabase()

  if (!sb) {
    const s = memStore.get(id)
    if (!s) return null
    if (status === 'clear') delete s.rsvps[name]
    else s.rsvps[name] = status
    memStore.set(id, s)
    return s
  }

  // read-modify-write the rsvps map (fine for this app's low traffic)
  const { data: existing, error: readErr } = await sb.from(TABLE).select('*').eq('id', id).maybeSingle()
  if (readErr) throw new Error(readErr.message)
  if (!existing) return null

  const current = (existing as SessionRow).rsvps ?? {}
  if (status === 'clear') delete current[name]
  else current[name] = status

  const { data, error } = await sb.from(TABLE).update({ rsvps: current }).eq('id', id).select().single()
  if (error) throw new Error(error.message)
  return rowToSession(data as SessionRow)
}
