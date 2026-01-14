'use client' // Markiert diese Datei als Client Component (läuft im Browser)

import { useState, useEffect } from 'react'
import Link from 'next/link'

import './style.css'
import { loadTools, storeTools, loadCategories } from './actions'

// ======================================
// PAGE: Werkzeuge / Maschinen
// ======================================
export default function Page() {

  // =====================
  // STATE
  // =====================

  // Liste aller Tools aus der DB
  const [tools, setTools] = useState<any[]>([])

  // Liste der Kategorien
  const [categories, setCategories] = useState<any[]>([])

  // Modal sichtbar / unsichtbar
  const [showWindow, setShowWindow] = useState(false)

  // Formularzustand für neues Tool
  const [form, setForm] = useState({ name: '', category: '' })

  // Filter & Suche
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterAvailable, setFilterAvailable] = useState('')

  // =====================
  // EFFECTS
  // =====================

  // Lädt Tools & Kategorien beim ersten Rendern
  useEffect(() => {
    loadToolsfromDB()
    loadCategoriesFromDB()
  }, [])

  // =====================
  // DATA LOADING
  // =====================

  // Tools aus der DB laden
  async function loadToolsfromDB() {
    const data = await loadTools()
    setTools(data)
  }

  // Kategorien aus der DB laden
  async function loadCategoriesFromDB() {
    try {
      const data = await loadCategories()
      setCategories(data)

      // Erste Kategorie automatisch auswählen
      if (data.length > 0 && !form.category) {
        setForm(prev => ({ ...prev, category: data[0].name }))
      }
    } catch (error) {
      console.error('Failed to load categories:', error)
    }
  }

  // =====================
  // ACTIONS
  // =====================

  // Bearbeiten → Weiterleitung zur Edit-Seite
  function handleEdit(toolId: string) {
    window.location.href = `/tools/${toolId}/edit`
  }

  // Löschen mit Abhängigkeitsprüfung
  async function handleDelete(tool: any) {
    if (tool.activeTasksCount > 0) {
      alert('Tool kann nicht gelöscht werden – es existieren aktive Tasks.')
      return
    }

    const confirmed = confirm(`"${tool.name}" wirklich löschen?`)
    if (!confirmed) return

    // TODO: deleteTool(tool.id)
    await loadToolsfromDB()
  }

  // Neues Tool speichern
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!form.name.trim()) {
      alert('Bitte gib einen Tool-Namen ein.')
      return
    }

    await storeTools(form, true)

    // Formular zurücksetzen & Modal schließen
    setForm({ name: '', category: categories[0]?.name ?? '' })
    setShowWindow(false)

    // Liste neu laden
    await loadToolsfromDB()
  }

  // =====================
  // FILTER LOGIC
  // =====================

  // Gefilterte Tools für Tabellenanzeige
  const filteredTools = tools.filter(tool => {
    return (
      tool.name.toLowerCase().includes(search.toLowerCase()) &&
      (!filterCategory || tool.category === filterCategory) &&
      (
        !filterAvailable ||
        (filterAvailable === 'available' && tool.available) ||
        (filterAvailable === 'unavailable' && !tool.available)
      )
    )
  })

  // =====================
  // RENDER
  // =====================

  return (
    <div className="page-container">

      {/* Filter & Suche */}
      <div className="filters">
        <input
          placeholder="Suche nach Name"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />

        <select onChange={e => setFilterCategory(e.target.value)}>
          <option value="">Alle Kategorien</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>

        <select onChange={e => setFilterAvailable(e.target.value)}>
          <option value="">Alle</option>
          <option value="available">Verfügbar</option>
          <option value="unavailable">Nicht verfügbar</option>
        </select>

        {/* Create Button */}
      <button
        onClick={() => setShowWindow(true)}
        className="create-button"
      >
        Create Tool
      </button>
      </div>

      {/* Tabelle */}
      <div className="table-wrapper">
        <table className="tools-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Kategorie</th>
              <th>Bild</th>
              <th>Beschreibung</th>
              <th>Verfügbarkeit</th>
              <th>Area</th>
              <th>Aktive Tasks</th>
              <th>Aktionen</th>
            </tr>
          </thead>

          <tbody>
            {filteredTools.map(tool => (
              <tr key={tool.id}>
                <td>{tool.name}</td>
                <td>{tool.category}</td>

                <td>
                  {tool.imageUrl ? (
                    <img
                      src={tool.imageUrl}
                      alt={tool.name}
                      className="thumb"
                    />
                  ) : '-'}
                </td>

                <td>
                  {tool.description
                    ? tool.description.slice(0, 40) + '…'
                    : '-'}
                </td>

                <td>
                  <span className={tool.available ? 'status-ok' : 'status-bad'}>
                    {tool.available ? 'Verfügbar' : 'Nicht verfügbar'}
                  </span>
                </td>

                <td>{tool.area ?? '-'}</td>
                <td>{tool.activeTasksCount ?? 0}</td>

                <td className="actions">
                  <button onClick={() => handleEdit(tool.id)}>
                    Bearbeiten
                  </button>
                  <button onClick={() => handleDelete(tool)}>
                    Löschen
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL: Neues Tool erstellen */}
      {showWindow && (
        <div className="modal-overlay">
          <div className="modal-window">
            <h2 className="modal-title">Neues Tool erstellen</h2>

            <form onSubmit={handleSubmit} className="modal-form">
              <input
                type="text"
                placeholder="Tool-Name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
                className="modal-input"
              />

              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                className="modal-select"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <div className="modal-buttons">
                <button type="submit" className="modal-save">
                  Speichern
                </button>
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

    </div>
  )
}
