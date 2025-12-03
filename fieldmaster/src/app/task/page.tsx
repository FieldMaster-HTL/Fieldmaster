//FMST-35

"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { getAllTasksAction, createTaskAction, deleteTaskAction } from "./actions";
import { Task } from "@/src/server/db/type/DBTypes";

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]); // store all tasks
  const [newTaskName, setNewTaskName] = useState(""); // new task title
  const [newTaskDescription, setNewTaskDescription] = useState(""); // new task description
  const [dueTo, setDueTo] = useState(""); // new task due date
  const [showModal, setShowModal] = useState(false); // show task details modal
  const [selectedTask, setSelectedTask] = useState<Task | null>(null); // currently selected task
  const [isPending, startTransition] = useTransition(); // transition for async updates
  const [error, setError] = useState(""); // error message for the form
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null); // task selected for deletion
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // show delete confirmation modal

  // fetch all tasks from server
  const fetchTasks = async () => {
    const res = await getAllTasksAction();
    setTasks(res);
  };

  useEffect(() => {
    const fetchAllTasks = async () => {
      await fetchTasks();
    };
    fetchAllTasks();
  }, []);

  // handle form submission to add new task
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newTaskName.trim()) return;

    startTransition(async () => {
      try {
        setError("");
        const creatorClerkId = localStorage.getItem("creatorClerkId") ?? undefined;
        const dueDate = dueTo ? new Date(dueTo) : undefined;
        await createTaskAction(newTaskName, newTaskDescription, creatorClerkId, dueDate);
        await fetchTasks();
        setNewTaskName("");
        setNewTaskDescription("");
        setDueTo("");
      } catch (err) {
        setError("Failed to create task. Please try again.");
      }
    });
  };

  return (
    <main className="bg-surface flex min-h-screen items-center justify-center p-6">
      <section className="bg-elevated relative w-full max-w-3xl rounded-lg border p-8 shadow-md">
        <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-primary-500 text-3xl font-extrabold md:text-4xl">Tasks</h1>
            <p className="text-foreground/90 mt-2 text-sm">
              Verwaltungstool für Felder und Einsätze — schnell, übersichtlich und zuverlässig.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/about"
              className="bg-secondary-100 border-secondary-500 inline-block rounded-md border px-4 py-2 text-white"
            >
              Mehr erfahren
            </Link>
          </div>
        </header>

        {/* Add new Task form */}
        <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-2">
          <input
            type="text"
            value={newTaskName}
            onChange={(e) => setNewTaskName(e.target.value)}
            placeholder="Titel der Aufgabe..."
            className="rounded-md border p-2"
          />
          <textarea
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
            placeholder="Beschreibung (optional)..."
            className="min-h-[80px] rounded-md border p-2"
          />
          <input
            type="date"
            value={dueTo}
            onChange={(e) => setDueTo(e.target.value)}
            className="rounded-md border p-2"
            placeholder="Enddatum (optional)"
          />
          {error && <div className="mb-2 text-sm text-red-500">{error}</div>}
          <button
            type="submit"
            disabled={isPending}
            className="bg-primary-500 self-start rounded-md px-4 py-2 text-white shadow-sm hover:opacity-95"
          >
            {isPending ? "Speichern..." : "Hinzufügen"}
          </button>
        </form>

        {/* Task List */}
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="bg-background hover:bg-foreground/5 border-foreground/20 relative rounded-md border p-3"
            >
              <div
                className="cursor-pointer"
                onClick={() => {
                  setSelectedTask(task);
                  setShowModal(true);
                }}
              >
                <div className="font-semibold">{task.name}</div>
                {task.description && (
                  <div className="text-foreground/80 text-sm">{task.description}</div>
                )}
                {task.dueTo && (
                  <div className="text-foreground/70 mt-1 text-xs">
                    Bis: {new Date(task.dueTo).toLocaleDateString()}
                  </div>
                )}
              </div>

              {/* FMST-50 Task-Task delete
                          DELETE BUTTON */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setTaskToDelete(task);
                  setShowDeleteConfirm(true);
                }}
                className="absolute top-2 right-2 text-sm font-semibold text-red-600 hover:text-red-800"
              >
                DELETE
              </button>

              {/* DELETE CONFIRM MODAL */}
              {showDeleteConfirm && taskToDelete?.id === task.id && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="animate-fadeIn w-80 rounded-xl bg-white p-6 shadow-xl"
                  >
                    <h2 className="text-lg font-semibold text-gray-800">
                      Do you really want to delete the task "{taskToDelete.name}"?
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">This action cannot be undone.</p>

                    {/* BUTTONS */}
                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300"
                      >
                        exit
                      </button>

                      <button
                        onClick={() => {
                          startTransition(async () => {
                            await deleteTaskAction(taskToDelete.id);
                            await fetchTasks();
                            setShowDeleteConfirm(false);
                            setTaskToDelete(null);
                          });
                        }}
                        className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="from-primary-900 to-secondary-800 relative w-full max-w-md rounded-2xl border border-gray-700 bg-gradient-to-br via-gray-800 p-6 text-white shadow-2xl">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-3 text-2xl text-gray-400 hover:text-white"
            >
              ✕
            </button>

            <h2 className="text-primary-400 mb-2 text-2xl font-bold">{selectedTask.name}</h2>
            <p className="mb-4 text-sm text-gray-300">
              {selectedTask.description || "No description."}
            </p>
            <div className="border-t border-gray-700 pt-2 text-xs text-gray-400">
              <p>ID: {selectedTask.id}</p>
              <p>
                Created:{" "}
                {selectedTask.createdAt
                  ? new Date(selectedTask.createdAt).toLocaleString()
                  : "Unknown"}
              </p>
              {selectedTask.dueTo && (
                <p>Due: {new Date(selectedTask.dueTo).toLocaleDateString()}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
