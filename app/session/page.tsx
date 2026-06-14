import PageHeader from '@/components/PageHeader'
import SessionBuilder from '@/components/SessionBuilder'
import { COMMUNITY_GAMES, MEMBERS } from '@/lib/community'

export const metadata = {
  title: 'Session Collection',
}

export default function SessionPage() {
  return (
    <div className="wrap">
      <PageHeader />

      <header className="hero">
        <div className="eyebrow">Session Collection</div>
        <h1>What fits the table?</h1>
        <p>Pick who&apos;s playing tonight and pool their shelves — then call out the session.</p>
        <div className="rule"></div>
      </header>

      <SessionBuilder members={MEMBERS} games={COMMUNITY_GAMES} />
    </div>
  )
}
