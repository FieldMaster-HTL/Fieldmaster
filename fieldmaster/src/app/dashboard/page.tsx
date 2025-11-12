/// <reference types="react" />
'use client'

import React, { useEffect, useState } from 'react'

type Area = { id: string; name: string; description?: string }
type Task = { id: string; title: string; status?: string; areaId?: string }

export default function Page(): React.JSX.Element {
    const [view, setView] = useState<'areas' | 'tasks'>('areas')
    const [areas, setAreas] = useState<Area[]>([])
    const [tasks, setTasks] = useState<Task[]>([])
    const [loadingAreas, setLoadingAreas] = useState(true)
    const [loadingTasks, setLoadingTasks] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function load() {
            try {
                setLoadingAreas(true)
                setLoadingTasks(true)
                const [areasRes, tasksRes] = await Promise.all([fetch('/api/areas'), fetch('/api/tasks')])
                if (!areasRes.ok) throw new Error('Fehler beim Laden der Areas')
                if (!tasksRes.ok) throw new Error('Fehler beim Laden der Tasks')
                const areasJson: Area[] = await areasRes.json()
                const tasksJson: Task[] = await tasksRes.json()
                setAreas(areasJson)
                setTasks(tasksJson)
            } catch (err: any) {
                setError(err?.message ?? 'Unbekannter Fehler')
            } finally {
                setLoadingAreas(false)
                setLoadingTasks(false)
            }
        }
        load()
    }, [])

    return (
        <main className="flex justify-center items-start bg-surface p-6 min-h-screen">
            <section className="bg-elevated shadow-md p-6 border rounded-lg w-full max-w-4xl">
                <header className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    <div>
                        <h1 className="font-extrabold text-primary-500 text-2xl md:text-3xl">Dashboard</h1>
                        <p className="mt-1 text-foreground/90 text-sm">Übersicht über Areas und Tasks</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            aria-pressed={view === 'areas'}
                            onClick={() => setView('areas')}
                            className={`px-4 py-2 rounded-md font-medium ${view === 'areas' ? 'bg-primary-500 text-white' : 'bg-surface border'}`}
                        >
                            Areas ({areas.length})
                        </button>
                        <button
                            aria-pressed={view === 'tasks'}
                            onClick={() => setView('tasks')}
                            className={`px-4 py-2 rounded-md font-medium ${view === 'tasks' ? 'bg-primary-500 text-white' : 'bg-surface border'}`}
                        >
                            Tasks ({tasks.length})
                        </button>
                    </div>
                </header>

                <div className="mt-6">
                    {error && <div className="text-red-600 mb-4">Fehler: {error}</div>}

                    {view === 'areas' ? (
                        <section>
                            {loadingAreas ? (
                                <div>Loading areas…</div>
                            ) : areas.length === 0 ? (
                                <div className="text-foreground/80">Keine Areas vorhanden.</div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {areas.map((a) => (
                                        <article key={a.id} className="p-4 border rounded-md bg-surface">
                                            <h3 className="font-semibold text-primary-500">{a.name}</h3>
                                            {a.description && <p className="mt-2 text-sm text-foreground/90">{a.description}</p>}
                                        </article>
                                    ))}
                                </div>
                            )}
                        </section>
                    ) : (
                        <section>
                            {loadingTasks ? (
                                <div>Loading tasks…</div>
                            ) : tasks.length === 0 ? (
                                <div className="text-foreground/80">Keine Tasks vorhanden.</div>
                            ) : (
                                <div className="space-y-3">
                                    {tasks.map((t) => (
                                        <div key={t.id} className="p-4 border rounded-md bg-surface flex justify-between items-start">
                                            <div>
                                                <h4 className="font-semibold">{t.title}</h4>
                                                <p className="text-sm text-foreground/90 mt-1">Status: {t.status ?? 'offen'}</p>
                                            </div>
                                            {t.areaId && <span className="text-xs text-foreground/70">Area: {t.areaId}</span>}
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