'use client'

import { useMemo, useState } from 'react'
import { CommunityGame } from '@/lib/types'
import GameRow from './GameRow'

export default function SessionBuilder({
  members,
  games,
}: {
  members: string[]
  games: CommunityGame[]
}) {
  const [selected, setSelected] = useState<string[]>([])
  const [toAdd, setToAdd] = useState('')
  const [fitGroup, setFitGroup] = useState(false)
  const [description, setDescription] = useState('')

  const available = members.filter((m) => !selected.includes(m))

  function addPlayer() {
    if (toAdd && !selected.includes(toAdd)) {
      setSelected([...selected, toAdd])
      setToAdd('')
    }
  }

  // Pool = games owned by any selected player; owner pills trimmed to the table
  const pool = useMemo(() => {
    if (selected.length === 0) return []
    const sel = new Set(selected)
    return games
      .filter((g) => g.owners.some((o) => sel.has(o)))
      .filter((g) => (fitGroup ? g.maxPlayers >= selected.length && g.minPlayers <= selected.length : true))
      .map((g) => ({ ...g, owners: g.owners.filter((o) => sel.has(o)) }))
      .sort((a, b) => b.communityRating - a.communityRating)
  }, [games, selected, fitGroup])

  return (
    <div>
      <div className="controls">
        <div className="field">
          <label htmlFor="playerpick">I&apos;m playing with</label>
          <div className="playerrow">
            <select
              id="playerpick"
              className="select"
              value={toAdd}
              onChange={(e) => setToAdd(e.target.value)}
            >
              <option value="">Choose a player…</option>
              {available.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <button type="button" className="iconbtn" onClick={addPlayer} aria-label="Add player" disabled={!toAdd}>+</button>
          </div>
        </div>

        {selected.length > 0 && (
          <div className="chips">
            {selected.map((m) => (
              <span className="chip" key={m}>
                {m}
                <button type="button" onClick={() => setSelected(selected.filter((x) => x !== m))} aria-label={`Remove ${m}`}>×</button>
              </span>
            ))}
          </div>
        )}

        {selected.length > 0 && (
          <label className="count fitrow">
            <input type="checkbox" checked={fitGroup} onChange={(e) => setFitGroup(e.target.checked)} />
            Only show games that fit {selected.length} player{selected.length === 1 ? '' : 's'}
          </label>
        )}
      </div>

      {selected.length === 0 ? (
        <div className="empty">Add the players at your table to see what you can play tonight.</div>
      ) : (
        <>
          <div className="count pool-count">
            <strong>{pool.length}</strong> game{pool.length === 1 ? '' : 's'} on the table
          </div>

          <div className="glist">
            {pool.map((g) => (
              <GameRow key={g.id} game={g} showOwners />
            ))}
          </div>

          <div className="panel full session-call">
            <h2>Call the session</h2>
            <p>Add a note for the group — date, place, or which game you&apos;re locking in.</p>
            <textarea
              className="textarea"
              placeholder="e.g. Saturday 7pm at Dedi's — let's try Spirit Island"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </>
      )}
    </div>
  )
}
