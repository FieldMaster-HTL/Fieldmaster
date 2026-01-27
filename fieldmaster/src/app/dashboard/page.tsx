// FMST-7: Tasks anzeigen
// FMST-15: Areas anzeigen
// FMST-36: Dashboard anzeigen
// FMST-56: Area - search/filter functions (lorenzer)

'use client'

import React, { useEffect, useState } from 'react'
import { getAllAreas } from '@/src/app/area/actions'
import { getAllTasksAction } from '@/src/app/task/actions'

/**
 * Dashboard page component.
 *
 * Purpose:
 * - Load areas and tasks in parallel on mount.
 * - Present a toggle between "areas" and "tasks" views.
 * - Show loading states, empty states and an error banner on failure.
 *
 * External dependencies:
 * - getAllAreas(): expected to resolve to { areas: Area[] }
 * - getAllTasksAction(): expected to resolve to Task[]
 *
 * Notes for maintainers:
 * - Keep tests for: loading states, empty-list states, populated-list states, error handling, and toggle behavior.
 * - Date formatting uses toLocaleDateString('de-DE') for German display.
 */

/** Minimal Area type used by this component */
type Area = { id: string; name: string; size: number; category?: string }

/**
 * Minimal Task type used by this component.
 * - dueTo can be null; when present it is displayed as a localized date.
 */
type Task = {
  id: string
  name: string
  description: string | null
  creatorId: string | null
  createdAt: Date
  dueTo: Date | null
  areaId: string | null
}

/**
 * Dashboard React client component.
 * - No props.
 * - Manages local state for view, lists, loading flags and an error message.
 */
export default function Page(): React.JSX.Element {
  // UI view: either show areas or tasks
  const [view, setView] = useState<'areas' | 'tasks'>('areas')

  // loaded data
  const [areas, setAreas] = useState<Area[]>([])
  const [tasks, setTasks] = useState<Task[]>([])

  // loading flags for each resource
  const [loadingAreas, setLoadingAreas] = useState(true)
  const [loadingTasks, setLoadingTasks] = useState(true)

  // error text shown in a banner when any fetch fails
  const [error, setError] = useState<string | null>(null)

  // Search: live filter for the areas view
  // - `searchTerm` is updated on each keystroke (live)
  // - Only active in the 'areas' view; cleared when switching away (see effect below)
  const [searchTerm, setSearchTerm] = useState<string>('')

  // Category filter state
  // - `selectedCategories` holds the chosen category keys (e.g. 'WIESE')
  // - Empty array means no category filter (show all)
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  // Predefined categories (kept in sync with area creation form)
  const AREA_CATEGORIES = [
    'WIESE',
    'ACKER',
    'OBSTGARTEN',
    'WEINBERG',
    'WALD',
    'WEIDE',
    'SONSTIGES',
  ]

  // Normalization for search
  // - Converts the string to NFD and removes combining diacritics
  // - Makes comparison case-insensitive via `toLowerCase()`
  // Example: 'WÄLDER' -> 'walder'; searching 'w' matches 'Wiesen' and 'ä' is treated like 'a'
  const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  // `filteredAreas` is the list rendered in the areas view.
  // It is filtered by the normalized `searchTerm` and by `selectedCategories` when provided.
  const filteredAreas = areas.filter((a) => {
    const matchesSearch = normalize(a.name).includes(normalize(searchTerm))
    if (selectedCategories.length === 0) return matchesSearch
    const cat = (a as any).category ?? 'WIESE'
    return matchesSearch && selectedCategories.includes(cat)
  })
  // --- Sorting ---
  // sortKey: 'size' | 'tasks' | 'name'
  // sortDir: 'asc' | 'desc'
  const [sortKey, setSortKey] = useState<'size' | 'tasks' | 'name'>('name')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  // Precompute task counts per area to support sorting by number of tasks.
  const taskCountByArea = React.useMemo(() => {
    const m = new Map<string, number>()
    for (const t of tasks) {
      if (!t.areaId) continue
      m.set(t.areaId, (m.get(t.areaId) ?? 0) + 1)
    }
    return m
  }, [tasks])

  // Apply sorting to the filtered list before rendering.
  const sortedAreas = React.useMemo(() => {
    const copy = [...filteredAreas]
    copy.sort((a, b) => {
      if (sortKey === 'size') {
        const diff = a.size - b.size
        return sortDir === 'asc' ? diff : -diff
      }
      if (sortKey === 'tasks') {
        const ca = taskCountByArea.get(a.id) ?? 0
        const cb = taskCountByArea.get(b.id) ?? 0
        const diff = ca - cb
        return sortDir === 'asc' ? diff : -diff
      }
      // name
      const na = a.name.toLowerCase()
      const nb = b.name.toLowerCase()
      if (na < nb) return sortDir === 'asc' ? -1 : 1
      if (na > nb) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return copy
  }, [filteredAreas, sortKey, sortDir, taskCountByArea])
  // Load areas and tasks in parallel on first render.
  // The try/catch sets an error message and the finally ensures loading flags are cleared.
  useEffect(() => {
    async function load() {
      try {
        setError(null)
        setLoadingAreas(true)
        setLoadingTasks(true)

        const [{ areas }, tasksRes] = await Promise.all([getAllAreas(), getAllTasksAction()])

        // Defensive: fallback to empty arrays if responses are falsy
        setAreas(areas || [])
        setTasks(tasksRes || [])
      } catch (err: any) {
        setError(err?.message ?? 'Unbekannter Fehler beim Laden der Daten')
        console.error('Dashboard load error:', err)
      } finally {
        setLoadingAreas(false)
        setLoadingTasks(false)
      }
    }
    load()
  }, [])

  // clear search when leaving the areas view
  useEffect(() => {
    if (view !== 'areas') {
      setSearchTerm('')
      setSelectedCategories([])
    }
  }, [view])

  // Render
  return (
    <main className="flex justify-center items-start bg-surface p-6 min-h-screen">
      <section className="bg-elevated shadow-md p-6 border rounded-lg w-full max-w-4xl">
        <header className="flex md:flex-row flex-col md:justify-between md:items-center gap-4 mb-6">
          <div>
            <h1 className="font-extrabold text-primary-500 text-2xl md:text-3xl">Dashboard</h1>
            <p className="mt-1 text-foreground/90 text-sm">Übersicht über Areas und Tasks</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle buttons: aria-pressed reflects the current view */}
            <button
              aria-pressed={view === 'areas'}
              onClick={() => setView('areas')}
              className={`px-4 py-2 rounded-md font-medium transition ${view === 'areas' ? 'bg-primary-500 text-white' : 'bg-surface border border-primary-500/20'
                }`}
            >
              Areas ({areas.length})
            </button>
            <button
              aria-pressed={view === 'tasks'}
              onClick={() => setView('tasks')}
              className={`px-4 py-2 rounded-md font-medium transition ${view === 'tasks' ? 'bg-primary-500 text-white' : 'bg-surface border border-primary-500/20'
                }`}
            >
              Tasks ({tasks.length})
            </button>
          </div>
        </header>

        <div className="mt-6">
          {/* Error banner */}
          {error && (
            <div className="bg-red-100 mb-4 p-4 border border-red-400 rounded-md text-red-700">
              Fehler: {error}
            </div>
          )}

          {/* Conditional view rendering */}
          {view === 'areas' ? (
            <section>
              {/* Search input - updates on each keystroke and filters areas */}
              <div className="mb-4">
                <input
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search areas..."
                  aria-label="Search areas"
                  className="w-full p-2 border rounded-md"
                />
              </div>

              {/* Category filter: multiple selectable checkboxes. Empty = no filter. */}
              <div className="mb-4 flex flex-wrap gap-2 items-center">
                {AREA_CATEGORIES.map((c) => (
                  <label key={c} className="inline-flex items-center gap-2 px-2 py-1 bg-surface border rounded-md">
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(c)}
                      onChange={() =>
                        setSelectedCategories((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]))
                      }
                      aria-label={`Filter ${c}`}
                    />
                    <span className="text-sm">{c}</span>
                  </label>
                ))}
                {selectedCategories.length > 0 && (
                  <button
                    onClick={() => setSelectedCategories([])}
                    className="ml-2 text-sm text-primary-500 underline"
                    aria-label="Clear category filters"
                  >
                    Clear filters
                  </button>
                )}
              </div>
              {/* Sorting controls: size, number of tasks, alphabetic */}
              <div className="mb-4 flex items-center gap-3">
                <label className="text-sm">Sort by:</label>
                <select
                  value={`${sortKey}:${sortDir}`}
                  onChange={(e) => {
                    const [k, d] = e.target.value.split(':') as [typeof sortKey, typeof sortDir]
                    setSortKey(k)
                    setSortDir(d)
                  }}
                  className="p-1 border rounded-md text-black bg-white"
                  aria-label="Sort areas"
                >
                  <option className="text-black bg-white" value="name:asc">Name (A–Z)</option>
                  <option className="text-black bg-white" value="name:desc">Name (Z–A)</option>
                  <option className="text-black bg-white" value="size:asc">Size (ascending)</option>
                  <option className="text-black bg-white" value="size:desc">Size (descending)</option>
                  <option className="text-black bg-white" value="tasks:asc">Tasks (ascending)</option>
                  <option className="text-black bg-white" value="tasks:desc">Tasks (descending)</option>
                </select>
              </div>
              {/* Filtered results shown below */}
              {loadingAreas ? (
                <div className="text-foreground/70">Areas werden geladen…</div>
              ) : areas.length === 0 ? (
                <div className="text-foreground/80">Keine Areas vorhanden.</div>
              ) : (
                <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                  {sortedAreas.map((area) => (
                    <article key={area.id} className="bg-surface p-4 border border-primary-500/10 hover:border-primary-500/30 rounded-md transition">
                      <h3 className="font-semibold text-primary-500 text-lg">{area.name}</h3>
                      <p className="mt-2 text-foreground/90 text-sm">
                        Größe: <span className="font-medium">{area.size} m²</span>
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </section>
          ) : (
            <section>
              {loadingTasks ? (
                <div className="text-foreground/70">Tasks werden geladen…</div>
              ) : tasks.length === 0 ? (
                <div className="text-foreground/80">Keine Tasks vorhanden.</div>
              ) : (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div key={task.id} className="bg-surface p-4 border border-primary-500/10 hover:border-primary-500/30 rounded-md transition">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <h4 className="font-semibold text-foreground">{task.name}</h4>
                          {task.description && <p className="mt-1 text-foreground/90 text-sm">{task.description}</p>}
                        </div>
                        {task.dueTo && (
                          <span className="text-foreground/70 text-xs whitespace-nowrap">
                            Fällig: {new Date(task.dueTo).toLocaleDateString('de-DE')}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </section>
    </main>
  )
}