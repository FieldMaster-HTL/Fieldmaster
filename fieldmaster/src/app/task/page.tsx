//FMST-35

"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { getAllTasksAction, createTaskAction, deleteTaskAction, getTasksSortedFilteredAction } from "./actions";
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
  const [filter, setFilter] = useState<"all" | "active" | "deleted">("all"); // sorting states
  const [sort, setSort] = useState<"dueDate" | undefined>(undefined); // sorting after due date


  
  // fetch all tasks from server
  const fetchTasks = async (
    filterParam = filter,
    sortParam = sort,
  ) => {
    const res = await getTasksSortedFilteredAction({
      filter: filterParam,
      sort: sortParam,
    });

    if (res.error || !res.tasks) {
      console.error("Failed to fetch tasks:", res.error);
      setTasks([]);
      return;
    }

    setTasks(res.tasks);
  };


  useEffect(() => {
    fetchTasks();
  }, [filter, sort]);


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
      } catch {
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


      {/* MFST-75: */}
        <table className="w-full border-collapse border border-gray-50">
          <thead>
            <tr className="bg-gray-200/50">
              <th className="border p-2 text-left">Name</th>
              <th className="border p-2 text-left">Description</th>
              <th className="border p-2 text-left">Due Date</th>
              <th className="border p-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center p-4 italic text-gray-500">
                  Keine Aufgaben vorhanden.
                </td>
              </tr>
            )}

            {tasks.map((task) => {
              const isDeleted = task.description === "[DELETED]";
              return (
                <tr
                  key={task.id}
                className={`transition-colors ${isDeleted ? "hover:bg-gray-400/10" : "hover:bg-gray-200/20"}`}
                >
                  <td className="border p-2">{task.name}</td>
                  <td className="border p-2">{isDeleted ? "[DELETED]" : task.description || "-"}</td>
                  <td className="border p-2">{isDeleted ? "-" : task.dueTo ? new Date(task.dueTo).toLocaleDateString() : "-"}</td>
                  <td className="border p-2 flex gap-2">
                    {/* View Button */}
                    <button
                      onClick={() => { setSelectedTask(task); setShowModal(true); }}
                      className="rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600 transition-colors"
                      disabled={isDeleted} // disables view for deleted tasks
                    >
                      View
                    </button>

                    {/* Delete Button */}
                    {!isDeleted && (
                      <button
                        onClick={() => { setTaskToDelete(task); setShowDeleteConfirm(true); }}
                        className="relative rounded bg-red-500 px-3 py-1 text-white before:absolute before:inset-0 before:bg-black/10 before:opacity-0 hover:before:opacity-100 transition-opacity"
                      >
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* DELETE CONFIRM MODAL – außerhalb der Tabelle */}
        {showDeleteConfirm && taskToDelete && (
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

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300"
                >
                  Exit
                </button>

                <button
                  onClick={() => {
                    startTransition(async () => {
                      if (!taskToDelete) return;
                      try {
                        const result = await deleteTaskAction(taskToDelete.id);
                        if (result.error) {
                          setError(result.error);
                          return;
                        }
                        // Soft Delete im State markieren
                        setTasks(prev =>
                          prev.map(t =>
                            t.id === taskToDelete.id
                              ? { ...t, description: "[DELETED]", dueTo: null }
                              : t
                          )
                        );
                      } catch {
                        setError("Failed to delete task. Please try again.");
                      } finally {
                        setShowDeleteConfirm(false);
                        setTaskToDelete(null);
                      }
                    });
                  }}
                  className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
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
