'use client' // Markiert diese Datei als Client Component in Next.js (wird im Browser ausgeführt)

import { useState, useEffect } from 'react'
import Link from 'next/link'

import './style.css'
import { loadTools, storeTools, loadCategories } from './actions' // Funktionen zum Laden und Speichern von Tools und Kategorien

export default function Page() {
  // React State Hooks:
  const [tools, setTools] = useState<any[]>([]) // Liste der gespeicherten Tools
  const [categories, setCategories] = useState<any[]>([]) // Liste der Kategorien
  const [showWindow, setShowWindow] = useState(false) // Steuert, ob das Modal-Fenster angezeigt wird
  const [form, setForm] = useState({ name: '', category: '' }) // Formularzustand für neues Tool

  // Lädt die Tools und Kategorien beim ersten Rendern der Seite
  useEffect(() => {
    loadToolsfromDB()
    loadCategoriesFromDB()
  }, [])

  // Asynchrone Funktion, um Tools aus der Datenbank zu laden
  async function loadToolsfromDB() {
    const data = await loadTools() // Daten aus DB holen
    setTools(data) // Tools im State speichern
  }

  // Asynchrone Funktion, um Kategorien aus der Datenbank zu laden - FMST-19 (Polt Leonie)
  async function loadCategoriesFromDB() {
    try {
      const data = await loadCategories() // Kategorien aus DB holen
      setCategories(data) // Kategorien im State speichern
      // Setze die erste Kategorie als Standard, wenn vorhanden
      if (data.length > 0 && !form.category) {
        setForm(prev => ({ ...prev, category: data[0].name }))
      }
    } catch (error) {
      console.error('Failed to load categories:', error)
    }
  }

  // Formular absenden
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault() // Standardformularverhalten verhindern

    // Eingabevalidierung: Kein leerer Name erlaubt
    if (!form.name.trim()) {
      alert('Bitte gib einen Tool-Namen ein.')
      return
    }

    // Tool speichern (true könnte z. B. ein "create" Flag sein)
    await storeTools(form, true)
    
    // Formular zurücksetzen und Modal schließen
    setForm({ name: '', category: categories.length > 0 ? categories[0].name : '' })
    setShowWindow(false)

    // Liste neu laden, um das neue Tool anzuzeigen
    await loadToolsfromDB()
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Tools</h1>
      <Link className="page-link" href="/categories">Kategorien verwalten</Link>

      {/* BUTTON zum Öffnen des Erstellungsfensters */}
      <button onClick={() => setShowWindow(true)} className="create-button">
        Create Tool
      </button>

      {/* FMST-16: Werkzeug - Maschinen/Werkzeuge anzeigen 
          (Kulmer Klara) */}
      <ul className="tool-names">
        {tools.map((tool) => (
          <li key={tool.id}>{tool.name}</li>
        ))}
      </ul>

      {/* MODAL-FENSTER zum Erstellen eines neuen Tools */}
      {showWindow && (
        <div className="modal-overlay">
          <div className="modal-window">
            <h2 className="modal-title">Neues Tool erstellen</h2>

            {/* Formular für Name + Kategorie */}
            <form onSubmit={handleSubmit} className="modal-form">

              {/* 
                FMST-17: Werkzeug - Name wählen 
                (Kulmer Klara)
              */}
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
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))
                ) : (
                  <option value="">Keine Kategorien verfügbar</option>
                )}
              </select>

              {/* Buttons im Modal */}
              <div className="modal-buttons">
                <button type="submit" className="modal-save">Speichern</button>
                <button
                  type="button"
                  onClick={() => setShowWindow(false)}
                  className="modal-cancel"
                >
                  Abbrechen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* 
        FMST-18: Werkzeug - Beschreibung 
        (Kulmer Klara)
      */}
      {/* Detailansicht der Tools mit Kategorie & Verfügbarkeitsstatus */}
      <ul className="tool-list">
        {tools.map((tool) => (
          <li key={tool.id} className="tool-item">
            <h2 className="tool-name">{tool.name}</h2>
            <p className="tool-category">Kategorie: {tool.category}</p>
            <p className="tool-status">
              Status: {tool.available ? 'Verfügbar' : 'Nicht verfügbar'}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
