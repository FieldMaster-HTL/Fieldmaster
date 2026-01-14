//FMST-35

"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { getAllAreas } from "../area/actions";
import { getAllTasksAction, createTaskAction, deleteTaskAction, updateTaskAction } from "./actions";
import { Task } from "@/src/server/db/type/DBTypes";

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]); // store all tasks
  const [areas, setAreas] = useState<any[]>([]); // store all areas | FMST-11
  const [newTaskName, setNewTaskName] = useState(""); // new task title
  const [newTaskDescription, setNewTaskDescription] = useState(""); // new task description
  const [dueTo, setDueTo] = useState(""); // new task due date
  const [newTaskPriority, setNewTaskPriority] = useState("Mittel"); // new task priority
  const [newTaskAreaId, setNewTaskAreaId] = useState(""); // new task area | FMST-11
  const [showModal, setShowModal] = useState(false); // show task details modal
  const [selectedTask, setSelectedTask] = useState<(Task & { area?: string }) | null>(null); // currently selected task
  const [selectedTaskPriority, setSelectedTaskPriority] = useState("Mittel");
  const [isPending, startTransition] = useTransition(); // transition for async updates
  const [error, setError] = useState(""); // error message for the form
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null); // task selected for deletion
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // show delete confirmation modal
  const [filterPriority, setFilterPriority] = useState("Alle");
  const [sortByPriority, setSortByPriority] = useState(false);

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
        await createTaskAction(
          newTaskName,
          newTaskDescription,
          creatorClerkId,
          dueTo || undefined,
          newTaskPriority,
        );
        await fetchTasks();
        setNewTaskName("");
        setNewTaskDescription("");
        setDueTo("");
        setNewTaskPriority("Mittel");
        setNewTaskAreaId(""); // FMST-11
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
          <label className="mt-2 text-sm">Priorität (optional)</label>
          <select
            value={newTaskPriority}
            onChange={(e) => setNewTaskPriority(e.target.value)}
            className="max-w-xs rounded-md border p-2"
          >
            <option>Hoch</option>
            <option>Mittel</option>
            <option>Niedrig</option>
          </select>
          <input
            type="date"
            value={dueTo}
            onChange={(e) => setDueTo(e.target.value)}
            className="rounded-md border p-2"
            placeholder="Enddatum (optional)"
          />
          {/* FMST-11: Area selection dropdown */}
          <select
            value={newTaskAreaId}
            onChange={(e) => setNewTaskAreaId(e.target.value)}
            className="rounded-md border p-2"
            aria-label="Feld auswählen (optional)"
          >
            <option value="">-- Feld auswählen (optional) --</option>
            {areas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.name} {area.size ? `(${area.size})` : ""}
              </option>
            ))}
          </select>
          {error && <div className="mb-2 text-sm text-red-500">{error}</div>}
          <button
            type="submit"
            disabled={isPending}
            className="bg-primary-500 self-start rounded-md px-4 py-2 text-white shadow-sm hover:opacity-95"
          >
            {isPending ? "Speichern..." : "Hinzufügen"}
          </button>
        </form>

        {/* FMST-64: Task priority */}
        {/* Controls */}
        <div className="mb-3 flex items-center gap-3">
          <label className="text-sm">Filter:</label>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="rounded-md border p-2"
          >
            <option>Alle</option>
            <option>Hoch</option>
            <option>Mittel</option>
            <option>Niedrig</option>
          </select>
          <label className="ml-4 text-sm">Nach Priorität sortieren:</label>
          <input
            type="checkbox"
            checked={sortByPriority}
            onChange={(e) => setSortByPriority(e.target.checked)}
          />
        </div>

        {/* Task Table */}
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200/50">
              <th className="border border-gray-300 p-2 text-left">Name</th>
              <th className="border border-gray-300 p-2 text-left">Beschreibung</th>
              <th className="border border-gray-300 p-2 text-left">Priorität</th>
              <th className="border border-gray-300 p-2 text-left">Feld</th>
              <th className="border border-gray-300 p-2 text-left">Fälligkeitsdatum</th>
              <th className="border border-gray-300 p-2 text-left">Aktionen</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              let list = [...tasks];
              if (filterPriority && filterPriority !== "Alle") {
                list = list.filter((t) => (t.priority ?? "Mittel") === filterPriority);
              }
              if (sortByPriority) {
                const order: Record<string, number> = { Hoch: 0, Mittel: 1, Niedrig: 2 };
                list.sort(
                  (a, b) =>
                    (order[a.priority ?? "Mittel"] ?? 1) - (order[b.priority ?? "Mittel"] ?? 1),
                );
              }
              return list;
            })().length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="border border-gray-300 p-4 text-center text-gray-500 italic"
                >
                  Keine Aufgaben vorhanden.
                </td>
              </tr>
            ) : (
              /* FMST-64: Task priority Simon Opriessnig*/
              (() => {
                let list = [...tasks];
                if (filterPriority && filterPriority !== "Alle") {
                  list = list.filter((t) => (t.priority ?? "Mittel") === filterPriority);
                }
                if (sortByPriority) {
                  const order: Record<string, number> = { Hoch: 0, Mittel: 1, Niedrig: 2 };
                  list.sort(
                    (a, b) =>
                      (order[a.priority ?? "Mittel"] ?? 1) - (order[b.priority ?? "Mittel"] ?? 1),
                  );
                }
                return list.map((task) => (
                  <tr
                    key={task.id}
                    className="cursor-pointer border-t border-gray-300 hover:bg-gray-100"
                    onClick={() => {
                      setSelectedTask({
                        ...task,
                        area: task.areaId
                          ? (areas.find((a) => a.id === task.areaId)?.name ?? "Unbekannt")
                          : undefined,
                      });
                      setSelectedTaskPriority(task.priority ?? "Mittel");
                      setShowModal(true);
                    }}
                  >
                    <td className="border border-gray-300 p-2 font-semibold">{task.name}</td>
                    <td className="border border-gray-300 p-2 text-sm">
                      {task.description || "-"}
                    </td>
                    <td className="border border-gray-300 p-2">
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={task.priority ?? "Mittel"}
                          onChange={(e) => {
                            // Update local state for immediate feedback
                            setTasks((prev) =>
                              prev.map((t) =>
                                t.id === task.id ? { ...t, priority: e.target.value } : t,
                              ),
                            );
                          }}
                          className={`rounded border border-gray-300 p-1 text-sm font-semibold ${
                            task.priority === "Hoch"
                              ? "bg-red-200 text-red-900"
                              : task.priority === "Niedrig"
                                ? "bg-green-200 text-green-900"
                                : "bg-yellow-200 text-yellow-900"
                          }`}
                        >
                          <option>Hoch</option>
                          <option>Mittel</option>
                          <option>Niedrig</option>
                        </select>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startTransition(async () => {
                              try {
                                const updatedTask = tasks.find((t) => t.id === task.id);
                                if (updatedTask) {
                                  const res = await updateTaskAction(task.id, {
                                    priority: updatedTask.priority,
                                  });
                                  if (!res.error && res.task) {
                                    await fetchTasks();
                                  }
                                }
                              } catch (err) {
                                console.error(err);
                              }
                            });
                          }}
                          className="rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700"
                        >
                          Speichern
                        </button>
                      </div>
                    </td>
                    <td className="border border-gray-300 p-2 text-sm">
                      {task.areaId
                        ? (areas.find((a) => a.id === task.areaId)?.name ?? "Unbekannt")
                        : "-"}
                    </td>
                    <td className="border border-gray-300 p-2 text-sm">
                      {task.dueTo ? new Date(task.dueTo).toLocaleDateString() : "-"}
                    </td>
                    <td className="border border-gray-300 p-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setTaskToDelete(task);
                          setShowDeleteConfirm(true);
                        }}
                        className="rounded bg-red-600 px-3 py-1 text-sm text-white hover:bg-red-700"
                      >
                        Löschen
                      </button>
                    </td>
                  </tr>
                ));
              })()
            )}
          </tbody>
        </table>

        {/* DELETE CONFIRM MODAL */}
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
                Do you really want to delete the task &quot;{taskToDelete.name}&quot;?
              </h2>
              <p className="mt-2 text-sm text-gray-600">This action cannot be undone.</p>

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
                  className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
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
              {selectedTask.description || "Keine Beschreibung."}
            </p>
            {/* FMST-11: Display area in modal */}
            {selectedTask.area && (
              <p className="mb-4 text-sm text-gray-300">Feld: {selectedTask.area}</p>
            )}
            <div className="border-t border-gray-700 pt-2 text-xs text-gray-400">
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
              <div className="mt-3">
                <label className="text-xs text-gray-300">Priorität</label>
                <div className="mt-1 flex items-center gap-2">
                  <select
                    value={selectedTaskPriority}
                    onChange={(e) => setSelectedTaskPriority(e.target.value)}
                    className="rounded-md p-2 text-black"
                  >
                    <option>Hoch</option>
                    <option>Mittel</option>
                    <option>Niedrig</option>
                  </select>
                  <button
                    onClick={() => {
                      startTransition(async () => {
                        try {
                          const res = await updateTaskAction(selectedTask.id, {
                            priority: selectedTaskPriority,
                          });
                          if (!res.error && res.task) {
                            await fetchTasks();
                            setSelectedTask({ ...selectedTask, priority: selectedTaskPriority });
                          }
                        } catch (err) {
                          console.error(err);
                        }
                      });
                    }}
                    className="bg-primary-500 rounded px-3 py-1 text-white"
                  >
                    Speichern
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
