'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SearchForm({
  buttonLabel = 'View Collection',
  placeholder = 'BoardGameGeek username…',
}: {
  buttonLabel?: string
  placeholder?: string
}) {
  const [username, setUsername] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (username.trim()) {
      setIsLoading(true)
      router.push(`/${encodeURIComponent(username.trim())}`)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="search">
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder={placeholder}
        disabled={isLoading}
        autoComplete="off"
      />
      <button type="submit" className="btn" disabled={isLoading || !username.trim()}>
        {isLoading ? 'Loading…' : buttonLabel}
      </button>
    </form>
  )
}
