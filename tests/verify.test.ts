import { describe, it, expect, vi, afterEach } from 'vitest'
import { codeMatches, startVerification, checkVerification, isVerified } from '@/lib/verify'

// With no Supabase env (the test case), verify uses its in-memory store.

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('codeMatches', () => {
  it('matches when the web address contains the code (case-insensitive)', () => {
    expect(codeMatches('bbgc-verify-ABC123', 'bbgc-verify-abc123')).toBe(true)
    expect(codeMatches('my site: BBGC-VERIFY-ABC123 !', 'bbgc-verify-abc123')).toBe(true)
  })
  it('does not match empties or the wrong code', () => {
    expect(codeMatches('', 'x')).toBe(false)
    expect(codeMatches('https://example.com', 'bbgc-verify-abc123')).toBe(false)
  })
})

describe('verification flow (in-memory)', () => {
  it('starts unverified, verifies when the code is on the profile', async () => {
    const code = await startVerification('OwnerUser')
    expect(code).toMatch(/^bbgc-verify-/)
    expect(await isVerified('OwnerUser')).toBe(false)

    // BGG returns the code in the Web Address → ownership proven
    vi.stubGlobal('fetch', async () => ({ ok: true, text: async () => `<user><webaddress value="${code}" /></user>` }))
    expect(await checkVerification('OwnerUser')).toBe(true)
    expect(await isVerified('owneruser')).toBe(true) // case-insensitive key
  })

  it('stays unverified when the code is absent', async () => {
    await startVerification('Stranger')
    vi.stubGlobal('fetch', async () => ({ ok: true, text: async () => `<user><webaddress value="" /></user>` }))
    expect(await checkVerification('Stranger')).toBe(false)
    expect(await isVerified('Stranger')).toBe(false)
  })
})
