//FMST-35

'use client'

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { getAllTasksAction, createTaskAction, getAllAreasAction, getAllToolsAction, getAllTaskToolsAction, getToolsForTaskAction, setTaskToolsAction, updateTaskAction } from './actions'

export default function Tasks() {
    const [tasks, setTasks] = useState<any[]>([]) // store all tasks
    const [areas, setAreas] = useState<any[]>([]) // store all areas
    const [tools, setTools] = useState<any[]>([]) // store all tools - FMST-4
    const [taskTools, setTaskTools] = useState<any[]>([]) // store all task tools - FMST-4
    const [newTaskName, setNewTaskName] = useState('') // new task title
    const [newTaskDescription, setNewTaskDescription] = useState('') // new task description
    const [dueTo, setDueTo] = useState('') // new task due date
    const [areaId, setareaId] = useState('') // new task area ID
    const [showModal, setShowModal] = useState(false) // show task details modal
    const [selectedTask, setSelectedTask] = useState<any | null>(null) // currently selected task
    const [modalAreaId, setModalAreaId] = useState('')
    const [newTaskToolIds, setNewTaskToolIds] = useState<string[]>([])
    const [modalToolIds, setModalToolIds] = useState<string[]>([])
    const [isPending, startTransition] = useTransition() // transition for async updates
    const [error, setError] = useState('') // error message for the form

    // fetch all tasks from server
    const fetchTasks = async () => {
        const res = await getAllTasksAction()
        setTasks(res)
    }
    const fetchAreas = async () => {
        const res = await getAllAreasAction()
        setAreas(res)
    }
    const fetchTools = async () => {
        const res = await getAllToolsAction()
        setTools(res)
    }
    const fetchTaskTools = async () => {
        const res = await getAllTaskToolsAction()
        setTaskTools(res)
    }

    const loadToolsForTask = async (taskId: any) => {
        try {
            const assigned = await getToolsForTaskAction(taskId)
            setModalToolIds(assigned.map((t: any) => t.id))
        } catch (err) {
            const assigned = taskTools.filter((e) => e.taskId === taskId).map((e) => e.toolId)
            setModalToolIds(assigned)
        }
    }

    useEffect(() => {
        fetchTasks()
        fetchAreas()
        fetchTools() // FMST-4
        fetchTaskTools() // FMST-4
    }, [])

    // handle form submission to add new task
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!newTaskName.trim()) return

        startTransition(async () => {
            try {
                setError('')
                const creatorClerkId = localStorage.getItem('creatorClerkId') ?? undefined
                const dueDate = dueTo ? new Date(dueTo) : undefined
                const created = await createTaskAction(newTaskName, newTaskDescription, creatorClerkId, dueDate, areaId || undefined)
                // assign tools if any selected
                if (created?.id && newTaskToolIds.length > 0) {
                    await setTaskToolsAction(created.id, newTaskToolIds)
                }
                await fetchTasks()
                await fetchTaskTools()
                setNewTaskName('')
                setNewTaskDescription('')
                setDueTo('')
                setareaId('')
                setNewTaskToolIds([])
            } catch (err) {
                setError('Failed to create task. Please try again.')
            }
        })
    }

    return (
        <main className="flex justify-center items-center bg-surface p-6 min-h-screen">
            <section className="relative bg-elevated shadow-md p-8 border rounded-lg w-full max-w-3xl">
                <header className="flex md:flex-row flex-col md:justify-between md:items-center gap-4 mb-6">
                    <div>
                        <h1 className="font-extrabold text-primary-500 text-3xl md:text-4xl">Tasks</h1>
                        <p className="mt-2 text-foreground/90 text-sm">
                            Verwaltungstool für Felder und Einsätze — schnell, übersichtlich und zuverlässig.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/about"
                            className="inline-block bg-secondary-100 px-4 py-2 border border-secondary-500 rounded-md text-white"
                        >
                            Mehr erfahren
                        </Link>
                    </div>
                </header>

                {/* Add new Task form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-2 mb-6">
                    <input
                        type="text"
                        value={newTaskName}
                        onChange={(e) => setNewTaskName(e.target.value)}
                        placeholder="Titel der Aufgabe..."
                        className="p-2 border rounded-md"
                    />
                    <textarea
                        value={newTaskDescription}
                        onChange={(e) => setNewTaskDescription(e.target.value)}
                        placeholder="Beschreibung (optional)..."
                        className="p-2 border rounded-md min-h-[80px]"
                    />
                    <input
                        type="date"
                        value={dueTo}
                        onChange={(e) => setDueTo(e.target.value)}
                        className="p-2 border rounded-md"
                        placeholder="Enddatum (optional)"
                    />
                    {/* Area auswählen | FMST-11 */}
                    <select
                        value={areaId}
                        onChange={(e) => setareaId(e.target.value)}
                        className="bg-background shadow-sm p-2 pr-8 border border-foreground/20 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-foreground/90 appearance-none"
                        aria-label="Feld auswählen (optional)"
                    >
                        <option value="">-- Feld auswählen (optional) --</option>
                        {areas.map((a) => (
                            <option key={a.id} value={a.id}>
                                {a.name}{a.size ? ` (${a.size})` : ''}
                            </option>
                        ))}
                    </select>
                    {/* Tools auswählen beim Erstellen */}
                    <div className="mt-2">
                        <label className="block text-sm text-foreground/80 mb-1">Werkzeuge zuordnen (optional)</label>
                        <div aria-hidden={showModal} className="max-h-40 overflow-auto p-2 bg-background/50 rounded border border-foreground/10">
                            {tools.map((t) => (
                                <label key={t.id} className="flex items-center gap-2 text-sm mb-1">
                                    <input
                                        type="checkbox"
                                        checked={newTaskToolIds.includes(t.id)}
                                        onChange={(e) => {
                                            if (e.target.checked) setNewTaskToolIds((s) => [...s, t.id])
                                            else setNewTaskToolIds((s) => s.filter((id) => id !== t.id))
                                        }}
                                    />
                                    <span>{t.name} (hinzufügen)</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    {error && (
                        <div className="mb-2 text-red-500 text-sm">{error}</div>
                    )}
                    <button
                        type="submit"
                        disabled={isPending}
                        className="self-start bg-primary-500 hover:opacity-95 shadow-sm px-4 py-2 rounded-md text-white"
                    >
                        {isPending ? 'Speichern...' : 'Hinzufügen'}
                    </button>
                </form>

                {/* Task List */}
                <ul className="space-y-2">
                    {tasks.map((task) => (
                        <li
                            key={task.id}
                            className="bg-background hover:bg-foreground/5 p-3 border border-foreground/20 rounded-md cursor-pointer"
                            onClick={() => {
                                setSelectedTask({
                                    ...task,
                                    // Show area name in modal | FMST-11
                                    area: task.area ?? areas.find((a) => a.id === task.areaId)?.name ?? 'Unbekannt',
                                })
                                setModalAreaId(task.areaId ?? '')
                                setShowModal(true)
                                loadToolsForTask(task.id)
                            }}
                        >
                            <div className="font-semibold">{task.name}</div>
                            {task.description && (
                                <div className="text-foreground/80 text-sm">{task.description}</div>
                            )}
                            {/* Area anzeigen | FMST-11 */}
                            {(task.area || task.areaId) && (
                                <div className="text-foreground/80 text-sm">
                                    Feld: {task.area ?? areas.find((a) => a.id === task.areaId)?.name ?? 'Unbekannt'}
                                </div>
                            )}
                            {task.dueTo && (
                                <div className="mt-1 text-foreground/70 text-xs">
                                    Bis: {new Date(task.dueTo).toLocaleDateString()}
                                </div>
                            )}
                            {/* assigned tools badges */}
                            {taskTools.filter((e) => e.taskId === task.id).length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {taskTools.filter((e) => e.taskId === task.id).map((e) => {
                                        const tool = tools.find((t) => t.id === e.toolId)
                                        return (
                                            <span key={e.toolId} className="text-xs px-2 py-1 rounded bg-foreground/5 text-foreground/90">
                                                {tool ? tool.name : 'Werkzeug'}
                                            </span>
                                        )
                                    })}
                                </div>
                            )}
                        </li>
                    ))}
                    {tasks.length === 0 && (
                        <li className="text-foreground/70 italic">Keine Aufgaben vorhanden.</li>
                    )}
                </ul>
            </section>

            {/* Task Detail Modal */}
            {showModal && selectedTask && (
                <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/60 backdrop-blur-sm">
                    <div className="relative bg-gradient-to-br from-primary-900 via-gray-800 to-secondary-800 shadow-2xl p-6 border border-gray-700 rounded-2xl w-full max-w-md text-white">
                        <button
                            onClick={() => setShowModal(false)}
                            className="top-2 right-3 absolute text-gray-400 hover:text-white text-2xl"
                        >
                            ✕
                        </button>

                        <h2 className="mb-2 font-bold text-primary-400 text-2xl">{selectedTask.name}</h2>
                        <p className="mb-4 text-gray-300 text-sm">
                            {selectedTask.description || 'Keine Beschreibung.'}
                        </p>
                        <div className="mb-4">
                            {/* FMST-11 | Pachler */}
                            <label className="block text-sm text-gray-300 mb-1">Feld (ändern)</label>
                            <select
                                value={modalAreaId}
                                onChange={(e) => setModalAreaId(e.target.value)}
                                className="bg-gray-800 shadow-sm p-2 pr-8 border border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-400 text-white appearance-none w-full mb-3"
                                aria-label="Feld auswählen (optional)"
                            >
                                <option value="">-- Feld auswählen (optional) --</option>
                                {areas.map((a) => (
                                    <option key={a.id} value={a.id}>
                                        {a.name}{a.size ? ` (${a.size})` : ''}
                                    </option>
                                ))}
                            </select>

                            <p className="mb-2 text-gray-300 text-sm">Feld: {selectedTask.area}</p>

                            </div>
                        {/* FMST-4 | Pachler */}
                        <div className="mb-4">
                            <label className="block text-sm text-gray-300 mb-1">Werkzeuge zuordnen</label>
                            <div className="max-h-40 overflow-auto p-2 bg-gray-900/30 rounded">
                                {tools.map((t) => (
                                    <label key={t.id} className="flex items-center gap-2 text-sm mb-1">
                                        <input
                                            type="checkbox"
                                            checked={modalToolIds.includes(t.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) setModalToolIds((s) => [...s, t.id])
                                                else setModalToolIds((s) => s.filter((id) => id !== t.id))
                                            }}
                                        />
                                        <span>{t.name}</span>
                                    </label>
                                ))}
                            </div>
                            <div className="mt-2 flex gap-2">
                                <button
                                    onClick={() => {
                                        startTransition(async () => {
                                            try {
                                                await updateTaskAction(selectedTask.id, { areaId: modalAreaId || undefined })
                                                await setTaskToolsAction(selectedTask.id, modalToolIds)
                                                await fetchTasks()
                                                await fetchTaskTools()
                                                setShowModal(false)
                                            } catch (err) {
                                                console.error(err)
                                            }
                                        })
                                    }}
                                    className="bg-primary-500 px-3 py-1 rounded text-white"
                                >
                                    Speichern
                                </button>
                                <button
                                    onClick={() => setModalToolIds(taskTools.filter((e) => e.taskId === selectedTask.id).map((e) => e.toolId))}
                                    className="bg-secondary-100 px-3 py-1 rounded text-white"
                                >
                                    Zurücksetzen
                                </button>
                            </div>
                        </div>

                        <div className="pt-2 border-gray-700 border-t text-gray-400 text-xs">
                            <p>ID: {selectedTask.id}</p>
                            <p>
                                Erstellt:{' '}
                                {selectedTask.createdAt
                                    ? new Date(selectedTask.createdAt).toLocaleString()
                                    : 'Unbekannt'}
                            </p>
                            {selectedTask.dueTo && (
                                <p>Fällig: {new Date(selectedTask.dueTo).toLocaleDateString()}</p>
                            )}
                            
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}
