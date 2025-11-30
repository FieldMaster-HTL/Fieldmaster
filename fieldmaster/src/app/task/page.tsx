//FMST-35

'use client'

import { useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { getAllTasksAction, createTaskAction, deleteTaskAction } from './actions'

export default function Tasks() {
    const [tasks, setTasks] = useState<any[]>([]) // store all tasks
    const [newTaskName, setNewTaskName] = useState('') // new task title
    const [newTaskDescription, setNewTaskDescription] = useState('') // new task description
    const [dueTo, setDueTo] = useState('') // new task due date
    const [showModal, setShowModal] = useState(false) // show task details modal
    const [selectedTask, setSelectedTask] = useState<any | null>(null) // currently selected task
    const [isPending, startTransition] = useTransition() // transition for async updates
    const [error, setError] = useState('') // error message for the form
    const [taskToDelete, setTaskToDelete] = useState<any | null>(null) // 
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)


    // fetch all tasks from server
    const fetchTasks = async () => {
    const res = await getAllTasksAction()
    const serialized = res.map(task => ({
        id: task.id,
        name: task.name,
        description: task.description ?? null,
        createdAt: task.createdAt ?? null,
        dueTo: task.dueTo ?? null,
    }))
    setTasks(serialized)
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
                const creatorClerkId = localStorage.getItem('creatorClerkId') ?? undefined
                const dueDate = dueTo ? new Date(dueTo) : undefined
                await createTaskAction(newTaskName, newTaskDescription, creatorClerkId, dueDate)
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
                            className="relative bg-background hover:bg-foreground/5 p-3 border border-foreground/20 rounded-md"
                        >
                            <div
                                className="cursor-pointer"
                                onClick={() => {
                                    setSelectedTask(task)
                                    setShowModal(true)
                                }}
                            >
                                <div className="font-semibold">{task.name}</div>
                                {task.description && (
                                    <div className="text-foreground/80 text-sm">{task.description}</div>
                                )}
                                {task.dueTo && (
                                    <div className="mt-1 text-foreground/70 text-xs">
                                        Bis: {new Date(task.dueTo).toLocaleDateString()}
                                    </div>
                                )}
                            </div>


                          {/* DELETE BUTTON */}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation() // verhindert Öffnen des Detail-Modals
                                    setTaskToDelete(task) // Task für später speichern
                                    setShowDeleteConfirm(true) // Bestätigungsfenster öffnen
                                }}
                                className="absolute top-2 right-2 text-red-600 hover:text-red-800 text-sm font-semibold"
                                >
                                DELETE
                                </button>

                                {/* DELETE CONFIRM MODAL */}
                                {showDeleteConfirm && taskToDelete?.id === task.id && (
                                <div
                                    className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50"
                                    onClick={() => setShowDeleteConfirm(false)}
                                >
                                    <div
                                    onClick={(e) => e.stopPropagation()}
                                    className="bg-white rounded-xl shadow-xl p-6 w-80 animate-fadeIn"
                                    >
                                    <h2 className="text-lg font-semibold text-gray-800">
                                        Do you really want to delete the task "{taskToDelete.name}"?
                                    </h2>
                                    <p className="text-sm text-gray-600 mt-2">
                                        This action cannot be undone.
                                    </p>

                                    {/* BUTTONS */}
                                    <div className="flex justify-end mt-6 space-x-3">
                                        <button
                                        onClick={() => setShowDeleteConfirm(false)}
                                        className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300"
                                        >
                                        exit
                                        </button>

                                        <button
                                        onClick={() => {
                                            startTransition(async () => {
                                            await deleteTaskAction(taskToDelete.id)
                                            await fetchTasks()
                                            setShowDeleteConfirm(false)
                                            setTaskToDelete(null)
                                            })
                                        }}
                                        className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                                        >
                                        Delete
                                        </button>
                                    </div>
                                </div>
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
                            {selectedTask.description || 'No description.'}
                        </p>
                        <div className="pt-2 border-gray-700 border-t text-gray-400 text-xs">
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
