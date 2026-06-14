import PageHeader from '@/components/PageHeader'
import SearchForm from '@/components/SearchForm'

export const metadata = {
  title: 'Update Collection',
}

export default function UpdatePage() {
  return (
    <div className="wrap">
      <PageHeader />

      <header className="hero">
        <div className="eyebrow">Update Collection</div>
        <h1>Resync from BGG</h1>
        <p>Enter a BoardGameGeek username to pull the latest owned games straight from their shelf.</p>
        <div className="rule"></div>
      </header>

      <div className="panel">
        <h2>Pull a collection</h2>
        <p>Try <strong>Deedeen</strong> to load a real BoardGameGeek collection.</p>
        <SearchForm buttonLabel="Update" placeholder="BoardGameGeek username…" />
      </div>
    </div>
  )
}
