//FMST-35

'use client'

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { getAllTasksAction, createTaskAction } from './actions'

export default function Tasks() {
    const [tasks, setTasks] = useState<any[]>([]) // store all tasks
    const [newTaskName, setNewTaskName] = useState('') // new task title
    const [newTaskDescription, setNewTaskDescription] = useState('') // new task description
    const [dueTo, setDueTo] = useState('') // new task due date
    const [showModal, setShowModal] = useState(false) // show task details modal
    const [selectedTask, setSelectedTask] = useState<any | null>(null) // currently selected task
    const [isPending, startTransition] = useTransition() // transition for async updates
    const [error, setError] = useState('') // error message for the form

    // fetch all tasks from server
    const fetchTasks = async () => {
        const res = await getAllTasksAction()
        setTasks(res)
    }

    useEffect(() => {
        fetchTasks()
    }, [])

    // handle form submission to add new task
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!newTaskName.trim()) return

        startTransition(async () => {
            try {
                setError('')
                const dueDate = dueTo ? new Date(dueTo) : undefined
                await createTaskAction(newTaskName, newTaskDescription, undefined, /*undefined,*/ dueDate)
                await fetchTasks()
                setNewTaskName('')
                setNewTaskDescription('')
                setDueTo('')
            } catch (err) {
                setError('Failed to create task. Please try again.')
            }
        })
    }

    return (
        <main className="flex justify-center items-center bg-surface p-6 min-h-screen">
            <section className="bg-elevated shadow-md p-8 border rounded-lg w-full max-w-3xl relative">
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
                        className="border rounded-md p-2"
                    />
                    <textarea
                        value={newTaskDescription}
                        onChange={(e) => setNewTaskDescription(e.target.value)}
                        placeholder="Beschreibung (optional)..."
                        className="border rounded-md p-2 min-h-[80px]"
                    />
                    <input
                        type="date"
                        value={dueTo}
                        onChange={(e) => setDueTo(e.target.value)}
                        className="border rounded-md p-2"
                        placeholder="Enddatum (optional)"
                    />
                    {error && (
                        <div className="text-red-500 text-sm mb-2">{error}</div>
                    )}
                    <button
                        type="submit"
                        disabled={isPending}
                        className="bg-primary-500 hover:opacity-95 shadow-sm px-4 py-2 rounded-md text-white self-start"
                    >
                        {isPending ? 'Speichern...' : 'Hinzufügen'}
                    </button>
                </form>

                {/* Task List */}
                <ul className="space-y-2">
                    {tasks.map((task) => (
                        <li
                            key={task.id}
                            className="border border-foreground/20 rounded-md p-3 bg-background hover:bg-foreground/5 cursor-pointer"
                            onClick={() => {
                                setSelectedTask(task)
                                setShowModal(true)
                            }}
                        >
                            <div className="font-semibold">{task.name}</div>
                            {task.description && (
                                <div className="text-sm text-foreground/80">{task.description}</div>
                            )}
                            {task.dueTo && (
                                <div className="text-xs text-foreground/70 mt-1">
                                    Bis: {new Date(task.dueTo).toLocaleDateString()}
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
                <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 backdrop-blur-sm">
                    <div className="bg-gradient-to-br from-primary-900 via-gray-800 to-secondary-800 text-white rounded-2xl shadow-2xl p-6 w-full max-w-md relative border border-gray-700">
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute top-2 right-3 text-gray-400 hover:text-white text-2xl"
                        >
                            ✕
                        </button>

                        <h2 className="text-2xl font-bold text-primary-400 mb-2">{selectedTask.name}</h2>
                        <p className="text-sm text-gray-300 mb-4">
                            {selectedTask.description || 'No description.'}
                        </p>
                        <div className="text-xs text-gray-400 border-t border-gray-700 pt-2">
                            <p>ID: {selectedTask.id}</p>
                            <p>
                                Created:{' '}
                                {selectedTask.createdAt
                                    ? new Date(selectedTask.createdAt).toLocaleString()
                                    : 'Unknown'}
                            </p>
                            {selectedTask.dueTo && (
                                <p>Due: {new Date(selectedTask.dueTo).toLocaleDateString()}</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}
