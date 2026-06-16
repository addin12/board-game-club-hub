'use client'

import { useState } from 'react'
import { parseBggCsv } from '@/lib/bgg-csv'
import { CommunityGame } from '@/lib/types'
import CommunityList from './CommunityList'

export default function CsvImport() {
  const [games, setGames] = useState<CommunityGame[] | null>(null)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setError('')
    setStatus('Reading file…')

    let parsed
    try {
      parsed = parseBggCsv(await file.text())
    } catch {
      setStatus('')
      setError('Couldn’t read that file — make sure it’s a BGG collection CSV export.')
      return
    }

    if (parsed.length === 0) {
      setGames([])
      setStatus('')
      return
    }

    const mapped: CommunityGame[] = parsed.map((g) => ({ ...g, categories: [], owners: [] }))
    setGames(mapped)
    setStatus(`Imported ${mapped.length} games — fetching cover art…`)

    // Best-effort image enrichment; the list already works without it.
    try {
      const res = await fetch('/api/enrich', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: parsed.map((g) => g.id) }),
      })
      if (res.ok) {
        const imgs: Record<string, { thumbnail: string; image: string }> = await res.json()
        setGames(mapped.map((g) => (imgs[g.id] ? { ...g, ...imgs[g.id] } : g)))
      }
    } catch {
      /* keep placeholders */
    }
    setStatus(`Imported ${mapped.length} games.`)
  }

  return (
    <div>
      <div className="panel full">
        <h2>Upload a BGG collection (CSV)</h2>
        <p>
          On BoardGameGeek, open your collection → <strong>Export</strong> → download the CSV, then upload it here.
          Works even while BGG’s API is down.
        </p>
        <input type="file" accept=".csv,text/csv" className="pinput" onChange={onFile} aria-label="BGG collection CSV file" />
        {status && <p className="importstatus">{status}</p>}
        {error && <p className="formerror">{error}</p>}
      </div>

      {games !== null &&
        (games.length === 0 ? (
          <div className="empty">No owned games found in that file.</div>
        ) : (
          <CommunityList games={games} />
        ))}
    </div>
  )
}
