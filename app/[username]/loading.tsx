import PageHeader from '@/components/PageHeader'

export default function Loading() {
  return (
    <div className="wrap">
      <PageHeader />
      <header className="hero">
        <div className="eyebrow">Collection</div>
        <h1 className="skeleton-title">Loading shelf…</h1>
        <div className="rule"></div>
      </header>

      <div className="statgrid">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="statcard skeleton skeleton-stat" />
        ))}
      </div>

      <div className="glist">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="grow skeleton skeleton-row" />
        ))}
      </div>
    </div>
  )
}
