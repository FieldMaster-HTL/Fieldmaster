"use client"

import { create } from 'domain'
import Link from 'next/link'
import { use, useEffect, useState } from 'react'
import { createArea, getAllAreas } from '../area/actions'
import { get } from 'http'

type Area = {
  id: string
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Bitte einen Feldnamen eingeben.')
      return
    }

    const numericSize = typeof size === 'string' ? Number(size) : size
    if (!numericSize || Number.isNaN(numericSize) || numericSize <= 0) {
      setError('Bitte eine gültige Größe (größer als 0) eingeben.')
      return
    }

    const newArea = await createArea(name.trim(), String(numericSize))
    
    setAreas([...areas, { id: newArea[0].id, name: newArea[0].name, size: Number(newArea[0].size) }])
    
    resetForm()
  }
  useEffect(() => {
      async function fetchAreas() {
        const areasRes = await getAllAreas();
        console.log(areasRes);

        // Ensure we set an array — fall back to an empty array if the response is not an array
        setAreas(Array.isArray(areasRes) ? areasRes : []);
      }
      fetchAreas();

    }, []
  )

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
              style={{ padding: 8, backgroundColor: '#f0f0f0', color: '#000', border: '1px solid #ccc', borderRadius: 4 }}
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
              style={{ padding: 8, backgroundColor: '#f0f0f0', color: '#000', border: '1px solid #ccc', borderRadius: 4 }}
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
        {areas.length === 0 || !areas ? (
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