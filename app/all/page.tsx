import PageHeader from '@/components/PageHeader'
import CommunityList from '@/components/CommunityList'
import { COMMUNITY_GAMES, MEMBERS } from '@/lib/community'

export const metadata = {
  title: 'All Collection',
}

export default function AllCollectionPage() {
  return (
    <div className="wrap">
      <PageHeader />

      <header className="hero">
        <div className="eyebrow">All Collection</div>
        <h1>The community shelf</h1>
        <p>{COMMUNITY_GAMES.length} games owned across {MEMBERS.length} members — the whole Barudak Board Game Club library in one place.</p>
        <div className="rule"></div>
      </header>

      <CommunityList games={COMMUNITY_GAMES} showOwners />
    </div>
  )
}
