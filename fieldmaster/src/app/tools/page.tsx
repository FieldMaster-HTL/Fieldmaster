'use client' // Markiert diese Datei als Client Component (läuft im Browser)

import { useState, useEffect } from 'react'
import Link from 'next/link'

import './style.css'
import { loadTools, storeTools, loadCategories, deleteTool } from './actions'
import { getAllAreas } from '../area/actions'

export default function Page() {


  // Liste aller Tools aus der DB
  const [tools, setTools] = useState<any[]>([])

  // Liste der Kategorien
  const [categories, setCategories] = useState<any[]>([])

  // Modal sichtbar / unsichtbar
  const [showWindow, setShowWindow] = useState(false)

  // Liste der Areas
  const [areas, setAreas] = useState<string[]>([])

  // Modalfelder für bearbeiten/erstellen
  const emptyForm = {
    name: '',
    category: '',
    description: '',
    imageUrl: '',
    available: true,
    area: ''
  }

  const [form, setForm] = useState(emptyForm)

  // Tool das gerade bearbeitet wird
  const [editingTool, setEditingTool] = useState<any | null>(null)

  //drag and drop
  const [dragActive, setDragActive] = useState(false)
  const [imagePreview, setImagePreview] = useState('')
  
  // Filter & Suche
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterAvailable, setFilterAvailable] = useState('')


  // Lädt Tools & Kategorien beim ersten Rendern
  useEffect(() => {
    async function init() {
      // Kategorien laden
      const categoriesData = await loadCategories()
      setCategories(categoriesData)


      // Setze die erste Kategorie im Form, falls noch keine ausgewählt
      if (categoriesData.length > 0) {
      setForm(prev => ({
        ...prev,
        category: categoriesData[0].name
      }))
    }

      // Tools laden
      await loadToolsfromDB()
    }

    init()
  }, [])

  // Tools aus der DB laden
  async function loadToolsfromDB() {
    const data = await loadTools()
    setTools(data)
  }


  // funtktion zum Bearbeiten
  function handleEdit(tool: any) {
    setEditingTool(tool)

    setForm({
      name: tool.name ?? '',
      category: tool.category ?? '',
      description: tool.description ?? '',
      imageUrl: tool.imageUrl ?? '',
      available: tool.available ?? true,
      area: tool.area ?? ''
    })

    setShowWindow(true)
  }

  // Löschen mit Abhängigkeitsprüfung
 async function handleDelete(tool: any) {
  if (tool.activeTasksCount > 0) {
    alert('Tool kann nicht gelöscht werden – es existieren aktive Tasks.')
    return
  }

  const confirmed = confirm(`"${tool.name}" wirklich löschen?`)
  if (!confirmed) return

  await deleteTool(tool.id)
  await loadToolsfromDB()
 }
  // Neues Tool speichern / Tool bearbeiten
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!form.name.trim()) {
      alert('Name ist erforderlich')
      return
    }

    if (!form.category.trim()) {
    alert('Kategorie ist erforderlich')
    return
  }

    // Wenn editingTool gesetzt ist → UPDATE, sonst CREATE
    await storeTools(form, editingTool?.id)

    setShowWindow(false)
    setEditingTool(null)
    setForm(emptyForm)

    await loadToolsfromDB()
  }


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
          onClick={() => {
            setEditingTool(null)
            setForm({...emptyForm,category: categories[0]?.name || ''})
            setShowWindow(true)
          }}
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
                  <button onClick={() => handleEdit(tool)}>
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

      {/* MODAL: Neues Tool erstellen / bearbeiten */}
      {showWindow && (
        <div className="modal-overlay">
          <div className="modal-window">
            <h2 className="modal-title">{editingTool ? 'Tool bearbeiten' : 'Neues Tool erstellen'}</h2>
            <form onSubmit={handleSubmit} className="modal-form">

              <input
                type="text"
                placeholder="Tool-Name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                required
              />

              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                required
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>

              <textarea
                placeholder="Beschreibung"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />

              <input
                type="text"
                placeholder="Bild-URL"
                value={form.imageUrl}
                onChange={e => setForm({ ...form, imageUrl: e.target.value })}
              />

              <input
                type="text"
                placeholder="Area"
                value={form.area}
                onChange={e => setForm({ ...form, area: e.target.value })}
              />

              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={form.available}
                  onChange={e => setForm({ ...form, available: e.target.checked })}
                />
                Verfügbar
              </label>

              <div className="modal-buttons">
                <button type="submit" className="modal-save">
                  {editingTool ? 'Speichern' : 'Erstellen'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowWindow(false)
                    setEditingTool(null)
                    setForm(emptyForm)
                  }}
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
