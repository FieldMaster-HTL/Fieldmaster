//FMST-35

"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { getAllTasksAction, createTaskAction, deleteTaskAction } from "./actions";
import {getAllAreas} from "../area/actions";
// import { Task } from "@/src/server/db/type/DBTypes";

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]); // store all tasks
  const [areas, setAreas] = useState<any[]>([]); // store all areas | FMST-11
  const [newTaskName, setNewTaskName] = useState(""); // new task title
  const [newTaskDescription, setNewTaskDescription] = useState(""); // new task description
  const [dueTo, setDueTo] = useState(""); // new task due date
  const [newTaskAreaId, setNewTaskAreaId] = useState(""); // new task area | FMST-11
  const [showModal, setShowModal] = useState(false); // show task details modal
  const [selectedTask, setSelectedTask] = useState<(Task & { area?: string }) | null>(null); // currently selected task
  const [isPending, startTransition] = useTransition(); // transition for async updates
  const [error, setError] = useState(""); // error message for the form
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null); // task selected for deletion
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // show delete confirmation modal

  // fetch all tasks from server
  const fetchTasks = async () => {
    const res = await getAllTasksAction();
    if (res.error || !res.tasks) {
      console.error("Failed to fetch tasks:", res.error);
      setTasks([]);
      return;
    }
    setTasks(res.tasks);
  };

  // fetch all areas from server | FMST-11
  const fetchAreas = async () => {
    const res = await getAllAreas();
    if (res.error || !res.areas) {
      console.error("Failed to fetch areas:", res.error);
      setAreas([]);
      return;
    }
    setAreas(res.areas);
  };

  useEffect(() => {
    const fetchAllTasks = async () => {
      await fetchTasks();
      await fetchAreas();
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
        setNewTaskAreaId(""); // FMST-11
      } catch {
        setError("Failed to create task. Please try again.");
      }
    });
  };

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
          {/* FMST-11: Area selection dropdown */}
          <select
            value={newTaskAreaId}
            onChange={(e) => setNewTaskAreaId(e.target.value)}
            className="p-2 border rounded-md"
            aria-label="Feld auswählen (optional)"
          >
            <option value="">-- Feld auswählen (optional) --</option>
            {areas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.name} {area.size ? `(${area.size})` : ""}
              </option>
            ))}
          </select>
          {error && <div className="mb-2 text-red-500 text-sm">{error}</div>}
          <button
            type="submit"
            disabled={isPending}
            className="self-start bg-primary-500 hover:opacity-95 shadow-sm px-4 py-2 rounded-md text-white"
          >
            {isPending ? "Speichern..." : "Hinzufügen"}
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
                  setSelectedTask({
                    ...task,
                    // FMST-11: Show area name in modal
                    area: task.areaId ? (areas.find((a) => a.id === task.areaId)?.name ?? "Unbekannt") : undefined,
                  });
                  setShowModal(true);
                }}
              >
                <div className="font-semibold">{task.name}</div>
                {task.description && (
                  <div className="text-foreground/80 text-sm">{task.description}</div>
                )}
                {/* FMST-11: Display area name in task list */}
                {task.areaId && (
                  <div className="text-foreground/80 text-sm">
                    Feld: {areas.find((a) => a.id === task.areaId)?.name ?? "Unbekannt"}
                  </div>
                )}
                {task.dueTo && (
                  <div className="mt-1 text-foreground/70 text-xs">
                    Bis: {new Date(task.dueTo).toLocaleDateString()}
                  </div>
                )}
              </div>

              {/* FMST-50 Task-Task delete - DELETE BUTTON */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setTaskToDelete(task);
                  setShowDeleteConfirm(true);
                }}
                className="top-2 right-2 absolute font-semibold text-red-600 hover:text-red-800 text-sm"
              >
                DELETE
              </button>

              {/* DELETE CONFIRM MODAL */}
              {showDeleteConfirm && taskToDelete?.id === task.id && (
                <div
                  className="z-50 fixed inset-0 flex justify-center items-center bg-black/40 backdrop-blur-sm"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white shadow-xl p-6 rounded-xl w-80 animate-fadeIn"
                  >
                    <h2 className="font-semibold text-gray-800 text-lg">
                      Do you really want to delete the task &quot;{taskToDelete.name}&quot;?
                    </h2>
                    <p className="mt-2 text-gray-600 text-sm">This action cannot be undone.</p>

                    {/* BUTTONS */}
                    <div className="flex justify-end space-x-3 mt-6">
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg"
                      >
                        exit
                      </button>

                      <button
                        onClick={() => {
                          startTransition(async () => {
                            try {
                              const result = await deleteTaskAction(taskToDelete.id);
                              if (result.error) {
                                setError(result.error || "Failed to delete task.");
                                return;
                              }
                              await fetchTasks();
                            } catch {
                              setError("Failed to delete task. Please try again.");
                            } finally {
                              setShowDeleteConfirm(false);
                              setTaskToDelete(null);
                            }
                          });
                        }}
                        className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white"
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
              {selectedTask.description || "Keine Beschreibung."}
            </p>
            {/* FMST-11: Display area in modal */}
            {selectedTask.area && <p className="mb-4 text-gray-300 text-sm">Feld: {selectedTask.area}</p>}
            <div className="pt-2 border-gray-700 border-t text-gray-400 text-xs">
              <p>ID: {selectedTask.id}</p>
              <p>
                Erstellt:{" "}
                {selectedTask.createdAt
                  ? new Date(selectedTask.createdAt).toLocaleString()
                  : "Unbekannt"}
              </p>
              {selectedTask.dueTo && (
                <p>Fällig: {new Date(selectedTask.dueTo).toLocaleDateString()}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
