import Image from 'next/image'
import { CommunityGame } from '@/lib/types'
import { formatPlayTime, formatPlayerCount } from '@/lib/utils'

function StarIcon() {
  return <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.8 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8L12 2z" /></svg>
}
function UsersIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="9" cy="8" r="3" /><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" /><path d="M16 5.5a3 3 0 0 1 0 5.5M21 20c0-2.5-1.5-4.7-3.7-5.6" /></svg>
}
function ClockIcon() {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
}

export default function GameRow({ game, showOwners = false }: { game: CommunityGame; showOwners?: boolean }) {
  return (
    <div className="grow">
      <div className="gpic">
        {/* Use the pre-sized 300x320 thumbnail — crisp at 64px but small enough
            that Next's optimizer never times out (full originals can be multi-MB). */}
        <Image src={game.thumbnail || game.image} alt={game.name} fill sizes="64px" />
      </div>

      <div className="gmain">
        <a className="gname" href={`https://boardgamegeek.com/boardgame/${game.id}`} target="_blank" rel="noopener noreferrer">
          {game.name}
        </a>{' '}
        {game.yearPublished && <span className="gyear">({game.yearPublished})</span>}
        <div className="pills">
          {game.categories.slice(0, 3).map((c) => (
            <span className="pill" key={c}>{c}</span>
          ))}
          {showOwners && game.owners.map((o) => (
            <span className="opill" key={o}>{o}</span>
          ))}
        </div>
      </div>

      <div className="gstats">
        {game.communityRating > 0 && (
          <span className="stat rating"><StarIcon />{game.communityRating.toFixed(1)}</span>
        )}
        <span className="stat"><UsersIcon />{formatPlayerCount(game.minPlayers, game.maxPlayers)}</span>
        <span className="stat"><ClockIcon />{formatPlayTime(game.minPlayTime, game.maxPlayTime)}</span>
      </div>
    </div>
  )
}
