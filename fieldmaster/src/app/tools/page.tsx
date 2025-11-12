'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

import './style.css'
import { loadTools, storeTools } from './actions'

export default function Page() {
  const [tools, setTools] = useState<any[]>([])
  const [showWindow, setShowWindow] = useState(false)
  const [form, setForm] = useState({ name: '', category: 'Maschine' })

  // Tools beim Laden der Seite holen
  useEffect(() => {
    loadToolsfromDB()
  }, [])

  async function loadToolsfromDB() {
    const data = await loadTools()
    setTools(data)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    /* 
      FMST-17: Werkzeug - Name wählen 
      (Kulmer Klara)
    */
    if (!form.name.trim()) {
      alert('Bitte gib einen Tool-Namen ein.')
      return
    }

    await storeTools(form, true)
    /*
    MFST-18: Werkzeug - Beschreibung 
    (Kulmer Klara)
    */
    setForm({ name: '', category: 'Maschine' })
    setShowWindow(false)
    await loadToolsfromDB()
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Tools</h1>
      <Link className="page-link" href="/about"></Link>

      {/* CREATE BUTTON */}
      <button onClick={() => setShowWindow(true)} className="create-button">
        Create Tool
      </button>

      {/* Tool-Name */}
      <ul className="tool-names">
        {tools.map((tool) => (
          <li key={tool.id}>{tool.name}</li>
        ))}
      </ul>

      {/*overlay-window*/}
      {showWindow && (
        <div className="modal-overlay">
          <div className="modal-window">
            <h2 className="modal-title">Neues Tool erstellen</h2>
            <form onSubmit={handleSubmit} className="modal-form">
              <input
                type="text"
                placeholder="Tool-Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="modal-input"
              />
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="modal-select"
              >
                <option value="Maschine">Maschine</option>
                <option value="Handwerkzeug">Handwerkzeug</option>
              </select>
              <div className="modal-buttons">
                <button type="submit" className="modal-save">Speichern</button>
                <button type="button" onClick={() => setShowWindow(false)} className="modal-cancel">Abbrechen</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* FMST-16: Werkzeug - Maschinen/Werkzeuge anzeigen
        (Kulmer Klara ) */}
      <ul className="tool-list">
        {tools.map((tool) => (
          <li key={tool.id} className="tool-item">
            <h2 className="tool-name">{tool.name}</h2>
            <p className="tool-category">Kategorie: {tool.category}</p>
            <p className="tool-status">Status: {tool.available ? 'Verfügbar' : 'Nicht verfügbar'}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
