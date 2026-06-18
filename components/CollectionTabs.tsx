'use client'

import { useState } from 'react'
import { CommunityGame } from '@/lib/types'
import CommunityList from './CommunityList'
import SessionBuilder from './SessionBuilder'
import SearchForm from './SearchForm'
import CsvImport from './CsvImport'
import SyncFromBgg from './SyncFromBgg'

type Tab = 'browse' | 'session' | 'bgg'

const TABS: { id: Tab; label: string }[] = [
  { id: 'browse', label: 'Browse all' },
  { id: 'session', label: 'Plan a session' },
  { id: 'bgg', label: 'Add from BGG' },
]

export default function CollectionTabs({
  members,
  games,
  initialTab = 'browse',
}: {
  members: string[]
  games: CommunityGame[]
  initialTab?: Tab
}) {
  const [tab, setTab] = useState<Tab>(initialTab)

  return (
    <div>
      <div className="tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={tab === t.id ? 'tab is-active' : 'tab'}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'browse' && <CommunityList games={games} showOwners />}
      {tab === 'session' && <SessionBuilder members={members} games={games} />}
      {tab === 'bgg' && (
        <>
          <SyncFromBgg />
          <div className="mt-lg">
            <CsvImport />
          </div>
          <div className="panel full mt-lg">
            <h2>Just browsing? View any collection</h2>
            <p>Look at any BGG collection without adding it to the club. Try <strong>Deedeen</strong>.</p>
            <SearchForm buttonLabel="View collection" placeholder="BoardGameGeek username…" />
          </div>
        </>
      )}
    </div>
  )
}
