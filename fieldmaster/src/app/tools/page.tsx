'use client' // Markiert diese Datei als Client Component (läuft im Browser)

import { useState, useEffect } from 'react'
import Link from 'next/link'

import './style.css'
import { loadTools, storeTools, loadCategories, deleteTool, loadAreas } from './actions'
import { getAllAreas } from '../area/actions'
import { AnyAaaaRecord } from 'dns'

export default function Page() {


  // Liste aller Tools aus der DB
  const [tools, setTools] = useState<any[]>([])

  // Liste der Kategorien
  const [categories, setCategories] = useState<any[]>([])

  // Modal sichtbar / unsichtbar
  const [showWindow, setShowWindow] = useState(false)

  // Liste der Areas
  const [areas, setAreas] = useState<any[]>([])

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

  // Drag & Drop Handler
  //handle drag
const handleDrag = (e: React.DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
  if (e.type === "dragenter" || e.type === "dragover") {
    setDragActive(true)
  } else if (e.type === "dragleave") {
    setDragActive(false)
  }
}

//handle drop
const handleDrop = async (e: React.DragEvent) => {
  e.preventDefault()
  e.stopPropagation()
  setDragActive(false)

  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
    await handleImageFile(e.dataTransfer.files[0])
  }
}

//wenn bild geändert wird
const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files && e.target.files[0]) {
    await handleImageFile(e.target.files[0])
  }
}

const handleImageFile = async (file: File) => {
  // schaun obs ein bild ist
  if (!file.type.startsWith('image/')) {
    alert('Bitte nur Bilddateien hochladen')
    return
  }

  // größe beschränken
  if (file.size > 5 * 1024 * 1024) {
    alert('Bild ist zu groß (max 5MB)')
    return
  }

  
  const reader = new FileReader()
  reader.onloadend = () => {
    const base64String = reader.result as string
    setImagePreview(base64String)//zu base64 konvertieren
    setForm({ ...form, imageUrl: base64String })
  }
  reader.readAsDataURL(file)
}

  // Lädt Tools & Kategorien beim ersten Rendern
  useEffect(() => {
    async function init() {
      // Kategorien laden
      const categoriesData = await loadCategories()
      setCategories(categoriesData)

      // Areas laden
      const areasData = await loadAreas()
      setAreas(areasData)

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

  // tools aus db laden
  async function loadToolsfromDB() {
    const data = await loadTools()
    setTools(data)
  }


  // bearbeitungsfunktion
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
  
  setImagePreview('') // preview zurücksetzten
  setShowWindow(true)
}

  // löschen und achten auf abhängigkeit
 async function handleDelete(tool: any) {
  if (tool.activeTasksCount > 0) {
    alert('Tool kann nicht gelöscht werden – es existieren aktive Tasks.')
    return
  }

  const confirmed = confirm(`"${tool.name}" wirklich löschen?`) //noch mal abfragen
  if (!confirmed) return

  await deleteTool(tool.id)
  await loadToolsfromDB()
 }
  // neues tool speichern/bearbeiten
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

    // Wenn editingTool dann update sonnst create
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

      
      <div className="filters">
        <input
          placeholder="Suche nach Name"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />{/* allg. suche nach name */}

        <select onChange={e => setFilterCategory(e.target.value)}>
          <option value="">Alle Kategorien</option>{/* nach kategorie filtern */}
          {categories.map(cat => (
            <option key={cat.id} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>

        <select onChange={e => setFilterAvailable(e.target.value)}>{/* nach verfügbarkeit filtern */}
          <option value="">Alle</option>
          <option value="available">Verfügbar</option>
          <option value="unavailable">Nicht verfügbar</option>
        </select>

        {/*button zum erstellen von tool*/}
        <button
          onClick={() => {
            setEditingTool(null)
            setForm({...emptyForm, category: categories[0]?.name || ''})
            setImagePreview('') // Preview zurücksetzen
            setShowWindow(true)
          }}
          className="create-button"
          >
          Create Tool
        </button>
      </div>

      {/*tabelle mit allen nötigen spalten*/}
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

      {/*neues tool erstellen/bearbeiten*/}
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

              {/*drag and drop*/}
              <div
                className={`image-upload-area ${dragActive ? 'drag-active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {imagePreview || form.imageUrl ? (
                  <div className="image-preview-container">
                    <img 
                      src={imagePreview || form.imageUrl} 
                      alt="Preview" 
                      className="image-preview"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview('')
                        setForm({ ...form, imageUrl: '' })
                      }}
                      className="remove-image-btn"
                    >
                      ✕ Bild entfernen
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="upload-icon">📁</div>
                    <p>Bild hierher ziehen oder klicken zum Auswählen</p>
                    <p className="upload-hint">Max. 5MB</p>
                  </>
                )}
                
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="file-input-hidden"
                  id="file-input"
                />
                <label htmlFor="file-input" className="file-input-label">
                  oder Datei auswählen
                </label>
              </div>

             <select
                value={form.area}
                onChange={e => setForm({ ...form, area: e.target.value })}
              >
                <option value="">Keine Area</option>
                {areas.map(area => (
                  <option key={area.id} value={area.name}>
                    {area.name}
                  </option>
                ))}
              </select>

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
