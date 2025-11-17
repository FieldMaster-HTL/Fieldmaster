/// <reference types="react" />
'use client'

import React, { useEffect, useState } from 'react'
import { getAllAreas } from '@/src/app/area/actions'
import { getAllTasksAction } from '@/src/app/task/actions'

type Area = { id: string; name: string; size: number }
type Task = { id: string; name: string; description: string | null; creatorId: string | null; createdAt: Date; dueTo: Date | null; areaId: string | null }

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
                setError(null)
                setLoadingAreas(true)
                setLoadingTasks(true)

                const [areasRes, tasksRes] = await Promise.all([
                    getAllAreas(),
                    getAllTasksAction()
                ])

                setAreas(areasRes || [])
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

    return (
        <main className="flex justify-center items-start bg-surface p-6 min-h-screen">
            <section className="bg-elevated shadow-md p-6 border rounded-lg w-full max-w-4xl">
                <header className="flex md:flex-row flex-col md:justify-between md:items-center gap-4 mb-6">
                    <div>
                        <h1 className="font-extrabold text-primary-500 text-2xl md:text-3xl">Dashboard</h1>
                        <p className="mt-1 text-foreground/90 text-sm">Übersicht über Areas und Tasks</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            aria-pressed={view === 'areas'}
                            onClick={() => setView('areas')}
                            className={`px-4 py-2 rounded-md font-medium transition ${view === 'areas' ? 'bg-primary-500 text-white' : 'bg-surface border border-primary-500/20'}`}
                        >
                            Areas ({areas.length})
                        </button>
                        <button
                            aria-pressed={view === 'tasks'}
                            onClick={() => setView('tasks')}
                            className={`px-4 py-2 rounded-md font-medium transition ${view === 'tasks' ? 'bg-primary-500 text-white' : 'bg-surface border border-primary-500/20'}`}
                        >
                            Tasks ({tasks.length})
                        </button>
                    </div>
                </header>

                <div className="mt-6">
                    {error && (
                        <div className="bg-red-100 mb-4 p-4 border border-red-400 rounded-md text-red-700">
                            Fehler: {error}
                        </div>
                    )}

                    {view === 'areas' ? (
                        <section>
                            {loadingAreas ? (
                                <div className="text-foreground/70">Areas werden geladen…</div>
                            ) : areas.length === 0 ? (
                                <div className="text-foreground/80">Keine Areas vorhanden.</div>
                            ) : (
                                <div className="gap-4 grid grid-cols-1 md:grid-cols-2">
                                    {areas.map((area) => (
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
                                                    {task.description && (
                                                        <p className="mt-1 text-foreground/90 text-sm">{task.description}</p>
                                                    )}
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