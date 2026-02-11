'use client'
// FMST-19 (Polt Leonie) - Page zur Verwaltung von Kategorien
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { loadCategories, storeCategory } from '@/src/app/tools/actions'
import './style.css'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]) // Liste der Kategorien
  const [showModal, setShowModal] = useState(false) //Modal Steuerung
  const [categoryName, setCategoryName] = useState('') //kategoriename zustand
  const [isLoading, setIsLoading] = useState(false) //Ladezustand

  useEffect(() => {
    loadCategoriesFromDB() // kategorien aus db laden bei erster renderung0
  }, [])

  async function loadCategoriesFromDB() { // kategorien laden
    try {
      const data = await loadCategories()
      setCategories(data)
    } catch (error) {
      console.error('Failed to load categories:', error)
    }
  }

  async function handleAddCategory(e: React.FormEvent) { //kategorie hinzufügen
    e.preventDefault()
    
    if (!categoryName.trim()) {
      alert('Bitte gib einen Kategorienamen ein.')
      return
    }

    setIsLoading(true) //ladezustand setzen
    try {
      await storeCategory(categoryName)
      setCategoryName('')
      setShowModal(false)
      await loadCategoriesFromDB()
    } catch (error) {
      alert('Fehler beim Erstellen der Kategorie: ' + (error as Error).message)
    } finally {
      setIsLoading(false)
    }
  }

  return ( //modal um kategorie zu erstellen
    <div className="page-container">
      <h1 className="page-title">Kategorien verwalten</h1>
      <Link className="back-link" href="/tools">Zurück zu Tools</Link>

      <button 
        onClick={() => setShowModal(true)}
        className="create-button"
      >
        Neue Kategorie hinzufügen
      </button>

      <div className="categories-section">
        <h2 className="categories-title">Vorhandene Kategorien ({categories.length})</h2>
        {categories.length === 0 ? (
          <p className="no-categories">Noch keine Kategorien vorhanden.</p>
        ) : (
          <ul className="categories-list">
            {categories.map((cat) => (
              <li key={cat.id} className="category-item">
                {cat.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-window">
            <h2 className="modal-title">Neue Kategorie erstellen</h2>
            <form onSubmit={handleAddCategory}>
              <input
                type="text"
                placeholder="Kategoriename"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                disabled={isLoading}
                className="modal-input"
              />
              <div className="modal-buttons">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="modal-save"
                >
                  {isLoading ? 'Wird gespeichert...' : 'Speichern'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setCategoryName('')
                  }}
                  disabled={isLoading}
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
