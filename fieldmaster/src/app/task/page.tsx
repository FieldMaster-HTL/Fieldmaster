'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Task {
  id: string
  name: string
  description?: string
  creator_id?: string
  created_at?: string
  due_to?: string
  area_id?: string
}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTaskName, setNewTaskName] = useState('')
  const [newTaskDescription, setNewTaskDescription] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const fetchTasks = async () => {
    const mockData: Task[] = [
      {
        id: crypto.randomUUID(),
        name: 'Traktor warten',
        description: 'Ölstand prüfen und Filter wechseln',
        created_at: new Date().toISOString(),
      },
      {
        id: crypto.randomUUID(),
        name: 'Feld 3 düngen',
        description: 'Dünger NPK-15 verwenden',
        created_at: new Date().toISOString(),
      },
    ]
    setTasks(mockData)
  }

  const createTask = async (name: string, description: string) => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      name,
      description,
      created_at: new Date().toISOString(),
    }
    setTasks((prev) => [...prev, newTask])
    setSelectedTask(newTask)
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskName.trim()) return
    await createTask(newTaskName.trim(), newTaskDescription.trim())
    setNewTaskName('')
    setNewTaskDescription('')
  }

  useEffect(() => {
    fetchTasks()
  }, [])

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

        {/* Neue Task hinzufügen */}
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
          <button
            type="submit"
            className="bg-primary-500 hover:opacity-95 shadow-sm px-4 py-2 rounded-md text-white self-start"
          >
            Hinzufügen
          </button>
        </form>

        {/* Task-Liste */}
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
            </li>
          ))}
          {tasks.length === 0 && (
            <li className="text-foreground/70 italic">Keine Aufgaben vorhanden.</li>
          )}
        </ul>
      </section>

      {/* Modal-Fenster */}
      {showModal && selectedTask && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-2xl shadow-2xl p-6 w-full max-w-md relative border border-gray-700">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-3 text-gray-400 hover:text-white text-2xl"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold text-primary-400 mb-2">
              {selectedTask.name}
            </h2>
            <p className="text-sm text-gray-300 mb-4">
              {selectedTask.description || 'Keine Beschreibung vorhanden.'}
            </p>
            <div className="text-xs text-gray-400 border-t border-gray-700 pt-2">
              <p>ID: {selectedTask.id}</p>
              <p>Erstellt am: {new Date(selectedTask.created_at || '').toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}
