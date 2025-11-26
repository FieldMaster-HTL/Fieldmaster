"use client"

//Area FMST-30  / FMST-31

import React from 'react'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createArea, getAllAreas, deleteArea } from '../area/actions'

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
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const resetForm = () => {
    setName('')
    setSize('')
    setError(null)
  }

  const handleDeleteClick = (areaId: string) => {
    setDeletingId(areaId)
  }

  const confirmDelete = async (areaId: string) => {
    try {
      setError(null)
      await deleteArea(areaId)
      setAreas((prevAreas: Area[]) => prevAreas.filter((a: Area) => a.id !== areaId))
      setSuccessMessage('Area erfolgreich gelöscht.')
      setDeletingId(null)
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      setError('Fehler beim Löschen der Area.')
      console.error('Error deleting area:', err)
      setDeletingId(null)
    }
  }

  const cancelDelete = () => {
    setDeletingId(null)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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

    try {
     const newArea = await createArea(name.trim(), numericSize)
     
     if (!newArea || !Array.isArray(newArea) || !newArea[0]) {
       setError('Fehler beim Anlegen des Feldes.')
       return
     }
     
     setAreas((prevAreas: Area[]) => [...prevAreas, { 
       id: newArea[0].id, 
       name: newArea[0].name, 
       size: Number(newArea[0].size) 
     }])
     
     setSuccessMessage('Area erfolgreich erstellt.')
     resetForm()
     setTimeout(() => setSuccessMessage(null), 3000)
   } catch (err) {
     setError('Fehler beim Anlegen des Feldes.')
     console.error('Error creating area:', err)
   }
  }
  useEffect(() => {
      async function fetchAreas() {
        try {
          const areasRes = await getAllAreas();
          // Ensure we set an array — fall back to an empty array if the response is not an array
          setAreas(Array.isArray(areasRes) ? areasRes : []);
        } catch (err) {
          console.error('Error fetching areas:', err)
          setError('Fehler beim Laden der Areas.')
        }
      }
      fetchAreas();

    }, []
  )

  return (
    <div style={{ padding: 16 }}>
      <h1 style={{ color: 'var(--primary)' }}>Area anlegen</h1>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 8, maxWidth: 420 }} data-testid="area-form">
        <label style={{ display: 'flex', flexDirection: 'column' }}>
          <span>Feldname</span>
          <input
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
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
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSize(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="z. B. 100"
            aria-label="Größe"
            min={0}
              style={{ padding: 8, backgroundColor: '#f0f0f0', color: '#000', border: '1px solid #ccc', borderRadius: 4 }}
          />
        </label>

        {error && <div style={{ color: 'crimson' }}>{error}</div>}
        {successMessage && <div style={{ color: 'green' }}>{successMessage}</div>}

        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" style={{ padding: '8px 12px' }} data-testid="submit-button">Anlegen</button>
          <Link href="/" style={{ alignSelf: 'center', color: 'var(--primary)' }}>Zurück</Link>
        </div>
      </form>

      <section style={{ marginTop: 24 }}>
        <h2>Bestehende Areas</h2>
        {areas.length === 0 || !areas ? (
          <p>Keine Areas vorhanden.</p>
        ) : (
          <ul style={{ listStyleType: 'none', padding: 0 }}>
            {areas.map(a => (
              <li key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #eee' }}>
                <span>{a.name} — {a.size} m²</span>
                <button
                  onClick={() => handleDeleteClick(a.id)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: 4,
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                  data-testid={`delete-button-${a.id}`}
                >
                  Löschen
                </button>

                {deletingId === a.id && (
                  <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                  }}>
                    <div style={{
                      backgroundColor: 'white',
                      padding: '24px',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                      textAlign: 'center',
                      maxWidth: '400px'
                    }}>
                      <h3 style={{ marginTop: 0, marginBottom: '16px', color: '#333' }}>Area löschen?</h3>
                      <p style={{ marginBottom: '24px', color: '#666' }}>Möchtest du die Area "{a.name}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.</p>
                      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                        <button
                          onClick={() => confirmDelete(a.id)}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px'
                          }}
                          data-testid={`confirm-delete-${a.id}`}
                        >
                          Löschen
                        </button>
                        <button
                          onClick={cancelDelete}
                          style={{
                            padding: '8px 16px',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px'
                          }}
                          data-testid={`cancel-delete-${a.id}`}
                        >
                          Abbrechen
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}