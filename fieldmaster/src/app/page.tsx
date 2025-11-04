import Link from 'next/link'

export default function Page() {
  return (
    <div>
      <h1 style={{ color: 'var(--primary)' }}>Home</h1>
      <Link style={{ color: 'var(--primary)' }} href="/about">About</Link>
    </div>
  )
}