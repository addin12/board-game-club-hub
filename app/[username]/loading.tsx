import PageHeader from '@/components/PageHeader'

export default function Loading() {
  return (
    <div className="wrap">
      <PageHeader />
      <header className="hero">
        <div className="eyebrow">Collection</div>
        <h1 style={{ opacity: 0.5 }}>Loading shelf…</h1>
        <div className="rule"></div>
      </header>

      <div className="statgrid">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="statcard" style={{ height: 84, opacity: 0.5 }} />
        ))}
      </div>

      <div className="glist">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="grow" style={{ height: 88, opacity: 0.4 }} />
        ))}
      </div>
    </div>
  )
}
