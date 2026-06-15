import { BoardGame } from '@/lib/types'

export default function CollectionStats({ games }: { games: BoardGame[] }) {
  const totalGames = games.length
  const rated = games.filter((g) => g.communityRating > 0)
  const avgRating = rated.length
    ? (rated.reduce((s, g) => s + g.communityRating, 0) / rated.length).toFixed(1)
    : '—'
  const topRated = rated.reduce<BoardGame | null>((best, g) => (!best || g.communityRating > best.communityRating ? g : best), null)
  const minP = Math.min(...games.map((g) => g.minPlayers))
  const maxP = Math.max(...games.map((g) => g.maxPlayers))

  return (
    <div className="statgrid">
      <div className="statcard">
        <div className="k">Games</div>
        <div className="v">{totalGames}</div>
      </div>
      <div className="statcard">
        <div className="k">Avg Rating</div>
        <div className="v gold">{avgRating}{avgRating !== '—' && '★'}</div>
      </div>
      <div className="statcard">
        <div className="k">Plays</div>
        <div className="v">{minP}–{maxP}</div>
        <div className="sub">players supported</div>
      </div>
      <div className="statcard">
        <div className="k">Top Rated</div>
        <div className="v small">{topRated?.name ?? '—'}</div>
        {topRated && <div className="sub">{topRated.communityRating.toFixed(1)}★ on BGG</div>}
      </div>
    </div>
  )
}
