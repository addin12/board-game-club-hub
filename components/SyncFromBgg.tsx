'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CommunityGame } from '@/lib/types'
import CommunityList from './CommunityList'

export default function SyncFromBgg() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [saveAs, setSaveAs] = useState('')

  // verification state
  const [code, setCode] = useState('')
  const [verified, setVerified] = useState(false)
  const [starting, setStarting] = useState(false)
  const [checking, setChecking] = useState(false)
  const [verifyError, setVerifyError] = useState('')

  // sync state
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<{ member: string; count: number; games: CommunityGame[] } | null>(null)

  function onUsernameChange(value: string) {
    setUsername(value)
    // Changing the username invalidates any prior verification.
    setVerified(false)
    setCode('')
    setVerifyError('')
    setResult(null)
  }

  async function getCode() {
    const u = username.trim()
    if (!u) return
    setStarting(true)
    setVerifyError('')
    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, action: 'start' }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || 'Could not start verification.')
      setCode(body.code)
    } catch (e) {
      setVerifyError(e instanceof Error ? e.message : 'Could not start verification.')
    } finally {
      setStarting(false)
    }
  }

  async function verify() {
    const u = username.trim()
    if (!u) return
    setChecking(true)
    setVerifyError('')
    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, action: 'check' }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || 'Verification failed.')
      if (body.verified) setVerified(true)
      else setVerifyError("We couldn't find the code in your Web Address yet. Make sure you saved your BGG profile, then try again.")
    } catch (e) {
      setVerifyError(e instanceof Error ? e.message : 'Verification failed.')
    } finally {
      setChecking(false)
    }
  }

  async function sync() {
    const u = username.trim()
    if (!u || !verified) return
    setBusy(true)
    setError('')
    setResult(null)
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: u, member: saveAs.trim() || u }),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || 'Could not sync that collection.')
      const games: CommunityGame[] = (body.games ?? []).map((g: CommunityGame) => ({ ...g, categories: [], owners: [body.member] }))
      setResult({ member: body.member, count: body.count, games })
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not sync that collection.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <div className="panel full">
        <h2>Sync your collection from BGG</h2>
        <p>
          Add <strong>your own</strong> BoardGameGeek collection to the club library. To keep it yours, we&apos;ll have you
          prove you own the account first — no password needed.
        </p>

        <div className="syncrow">
          <input
            type="text"
            className="pinput"
            placeholder="Your BGG username"
            aria-label="BoardGameGeek username"
            value={username}
            onChange={(e) => onUsernameChange(e.target.value)}
          />
        </div>

        {/* Step 1 — verify ownership */}
        {!verified && (
          <div className="verifybox">
            {!code ? (
              <>
                <p className="importstatus">Step 1 — prove you own <strong>{username.trim() || 'this account'}</strong>.</p>
                <button type="button" className="btn" onClick={getCode} disabled={starting || !username.trim()}>
                  {starting ? 'Getting code…' : 'Get verification code'}
                </button>
              </>
            ) : (
              <>
                <p className="importstatus">Paste this code into your BGG profile&apos;s <strong>Web Address</strong> field, then verify:</p>
                <div className="vcode">{code}</div>
                <ol className="vsteps">
                  <li>Open BGG → your avatar → <strong>Profile → Edit</strong> (or <a href={`https://boardgamegeek.com/user/${encodeURIComponent(username.trim())}`} target="_blank" rel="noopener noreferrer">your profile</a>).</li>
                  <li>Paste the code into the <strong>Web Address</strong> field and <strong>Save</strong>.</li>
                  <li>Come back and click <strong>Verify</strong>. You can clear the field again afterwards.</li>
                </ol>
                <button type="button" className="btn" onClick={verify} disabled={checking}>
                  {checking ? 'Checking…' : "I've added it — Verify"}
                </button>
              </>
            )}
            {verifyError && <p className="formerror">{verifyError}</p>}
          </div>
        )}

        {/* Step 2 — sync (unlocked once verified) */}
        {verified && (
          <div className="verifybox">
            <p className="verifyok">✓ Verified — you own <strong>{username.trim()}</strong>.</p>
            <div className="syncrow">
              <input
                type="text"
                className="pinput"
                placeholder="Save as… (optional)"
                aria-label="Save as member name"
                value={saveAs}
                onChange={(e) => setSaveAs(e.target.value)}
                maxLength={40}
              />
              <button type="button" className="btn" onClick={sync} disabled={busy}>
                {busy ? 'Syncing…' : 'Sync collection'}
              </button>
            </div>
            {busy && <p className="importstatus">Pulling from BoardGameGeek… (large collections can take a few seconds)</p>}
            {error && <p className="formerror">{error}</p>}
            {result && (
              <div className="notice">
                Synced! <strong>{result.member}</strong>&apos;s {result.count} games are now in the community.{' '}
                <Link href="/collection">Browse the collection →</Link>
              </div>
            )}
          </div>
        )}
      </div>

      {result && result.games.length > 0 && <CommunityList games={result.games} />}
    </div>
  )
}
