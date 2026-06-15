'use client'

import Link from 'next/link'
import PageHeader from '@/components/PageHeader'

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  return (
    <div className="wrap">
      <PageHeader />

      <header className="hero">
        <div className="eyebrow">Collection</div>
        <h1>Couldn&apos;t load that shelf</h1>
        <div className="rule"></div>
      </header>

      <div className="panel">
        <h2>Something went wrong</h2>
        <p>{error.message || 'An unexpected error occurred while loading this collection.'}</p>
        {error.digest && <p className="errid">Error ID: {error.digest}</p>}
        <div className="search">
          <button type="button" className="btn" onClick={() => unstable_retry()}>Try again</button>
          <Link className="backlink" href="/">← Back to menu</Link>
        </div>
      </div>
    </div>
  )
}
