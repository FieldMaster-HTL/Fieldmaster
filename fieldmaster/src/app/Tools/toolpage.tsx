import Link from 'next/link'

export default function ToolsPage() {
  return (
    <div>
      <h1 style={{ color: 'var(--primary)' }}>Tools</h1>
      <p>Willkommen auf der Tools-Seite!</p>

      <Link style={{ color: 'var(--primary)' }} href="/">
        ← Zurück zur Startseite
      </Link>
    </div>
  )
}
