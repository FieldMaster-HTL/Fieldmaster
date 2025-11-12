"use client"

import Link from 'next/link'
import { useState } from 'react'

type Area = {
  id: number
  name: string
  size: number
}

export default function Page() {
  const [name, setName] = useState('')
  const [size, setSize] = useState<number | ''>('')
  const [areas, setAreas] = useState<Area[]>([])
  const [error, setError] = useState<string | null>(null)

  const resetForm = () => {
    setName('')
    setSize('')
    setError(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    // basic validation
    if (!name.trim()) {
      setError('Bitte einen Feldnamen eingeben.')
      return
    }

    const numericSize = typeof size === 'string' ? Number(size) : size
    if (!numericSize || Number.isNaN(numericSize) || numericSize <= 0) {
      setError('Bitte eine gültige Größe (größer als 0) eingeben.')
      return
    }

    const newArea: Area = {
      id: Date.now(),
      name: name.trim(),
      size: numericSize,
    }

    setAreas(prev => [newArea, ...prev])
    console.log('new area', newArea)
    resetForm()
  }

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ color: 'var(--primary)' }}>Area anlegen</h1>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 8, maxWidth: 420 }}>
        <label style={{ display: 'flex', flexDirection: 'column' }}>
          <span>Feldname</span>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="z. B. Acker 1"
            aria-label="Feldname"
            style={{ padding: 8 }}
          />
        </label>

        <label style={{ display: 'flex', flexDirection: 'column' }}>
          <span>Größe (m²)</span>
          <input
            type="number"
            value={size}
            onChange={e => setSize(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="z. B. 100"
            aria-label="Größe"
            min={0}
            style={{ padding: 8 }}
          />
        </label>

        {error && <div style={{ color: 'crimson' }}>{error}</div>}

        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" style={{ padding: '8px 12px' }}>Anlegen</button>
          <Link href="/" style={{ alignSelf: 'center', color: 'var(--primary)' }}>Zurück</Link>
        </div>
      </form>

      <section style={{ marginTop: 24 }}>
        <h2>Bestehende Areas</h2>
        {areas.length === 0 ? (
          <p>Keine Areas vorhanden.</p>
        ) : (
          <ul>
            {areas.map(a => (
              <li key={a.id}>{a.name} — {a.size} m²</li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}