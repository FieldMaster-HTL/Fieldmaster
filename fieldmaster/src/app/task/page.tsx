//FMST-35

"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { storeTools } from "../tools/actions";
import { getAllAreas } from "../area/actions";
import {
  getAllTasksAction,
  createTaskAction,
  deleteTaskAction,
  getTasksSortedFilteredAction,
  getAllToolsAction,
  getAllTaskToolsAction,
  getToolsForTaskAction,
  setTaskToolsAction,
  updateTaskAction,
  markTaskCompletedAction
} from "./actions";
import { Task } from "@/src/server/db/type/DBTypes";

export default function Tasks() {
  const [tasks, setTasks] = useState<any[]>([]); // store all tasks
  const [areas, setAreas] = useState<any[]>([]); // store all areas | FMST-11
  const [newTaskName, setNewTaskName] = useState(""); // new task title
  const [newTaskDescription, setNewTaskDescription] = useState(""); // new task description
  const [dueTo, setDueTo] = useState(""); // new task due date
  const [newTaskAreaId, setNewTaskAreaId] = useState(""); // new task area | FMST-11
  const [newTaskToolIds, setNewTaskToolIds] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false); // show task details modal
  const [selectedTask, setSelectedTask] = useState<(any & { area?: string }) | null>(null); // currently selected task
  const [isPending, startTransition] = useTransition(); // transition for async updates
  const [error, setError] = useState(""); // error message for the form
  const [taskToDelete, setTaskToDelete] = useState<any | null>(null); // task selected for deletion
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); // show delete confirmation modal
  const [filter, setFilter] = useState<"all" | "active" | "deleted">("all"); // sorting states
  const [sort, setSort] = useState<"dueDate" | undefined>(undefined); // sorting after due date
  const [filterPriority, setFilterPriority] = useState<"Alle" | "Hoch" | "Mittel" | "Niedrig">(
    "Alle",
  ); // priority filter
  const [newTaskPriority, setNewTaskPriority] = useState<"Hoch" | "Mittel" | "Niedrig">("Mittel"); // new task priority
  const [filterCompleted, setFilterCompleted] = useState<"all" | "open" | "completed">("all"); // FMST-54 | Pachler: Filter for completed tasks
  const [successMessage, setSuccessMessage] = useState(""); // FMST-54 | Pachler: Success message

  // Tools state (FMST-12)
  const [tools, setTools] = useState<any[]>([]);
  const [taskTools, setTaskTools] = useState<any[]>([]);
  const [modalToolIds, setModalToolIds] = useState<string[]>([]);
  const [modalAreaId, setModalAreaId] = useState("");
  const [newToolName, setNewToolName] = useState("");
  const [newToolCategory, setNewToolCategory] = useState("Maschine");
  // fetch all tasks from server
  const fetchTasks = async (filterParam = filter, sortParam = sort) => {
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

  // FMST-54 | Pachler: Auto-hide success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // fetch tools and task-tools (FMST-12)
  const fetchTools = async () => {
    try {
      const res = await getAllToolsAction();
      setTools(res || []);
    } catch (err) {
      console.error("Failed to fetch tools:", err);
      setTools([]);
    }
  };

  const fetchTaskTools = async () => {
    try {
      const res = await getAllTaskToolsAction();
      setTaskTools(res || []);
    } catch (err) {
      console.error("Failed to fetch task-tools:", err);
      setTaskTools([]);
    }
  };

  const loadToolsForTask = async (taskId: string) => {
    try {
      const assigned = await getToolsForTaskAction(taskId as any);
      setModalToolIds(assigned.map((t: any) => t.id));
    } catch (err) {
      // fallback to client-side mapping if server call fails
      const assigned = taskTools.filter((e) => e.taskId === taskId).map((e) => e.toolId);
      setModalToolIds(assigned);
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      await fetchTasks();
      await fetchAreas();
      await fetchTools();
      await fetchTaskTools();
    };
    fetchAllData();
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
        const areaIdValue = newTaskAreaId || undefined;
        const created = await createTaskAction(
          newTaskName,
          newTaskDescription,
          creatorClerkId,
          dueDate,
          newTaskPriority,
          areaIdValue,

        );
        // assign selected tools to the newly created task
        if (created?.task?.id && newTaskToolIds && newTaskToolIds.length > 0) {
          try {
            await setTaskToolsAction(created.task.id as any, newTaskToolIds);
          } catch (err) {
            console.error('Failed to set tools for new task:', err);
          }
        }
        await fetchTasks();
        await fetchTaskTools();
        setNewTaskName("");
        setNewTaskDescription("");
        setDueTo("");
        setNewTaskAreaId(""); // FMST-11
        setNewTaskPriority("Mittel");
        setNewTaskToolIds([]);
      } catch {
        setError("Failed to create task. Please try again.");
      }
    });
  };

  return (
    <main className="flex justify-center items-center bg-surface p-6 min-h-screen">
      <section className="relative bg-elevated shadow-md p-8 border rounded-lg w-full max-w-5xl">
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

          {/* Priority selection dropdown */}
          <select
            value={newTaskPriority}
            onChange={(e) => setNewTaskPriority(e.target.value as "Hoch" | "Mittel" | "Niedrig")}
            className="p-2 border rounded-md"
            aria-label="Priorität auswählen"
          >
            <option value="Hoch">Priorität: Hoch</option>
            <option value="Mittel">Priorität: Mittel</option>
            <option value="Niedrig">Priorität: Niedrig</option>
          </select>

          {/* FMST-12: Tool selection multi-select | Pachler Tobias */}
          <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Werkzeuge (optional)
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Mehrfachauswahl mit Strg/Cmd oder Shift. Ausgewählt: {newTaskToolIds.length}
            </p>
            <select
              multiple
              value={newTaskToolIds}
              onChange={(e) =>
                setNewTaskToolIds(
                  Array.from(e.target.selectedOptions).map((o) => o.value)
                )
              }
              className="w-full rounded border border-gray-300 bg-white p-2 text-sm shadow-inner focus:border-primary-500 focus:outline-none"
            >
              {tools.map((tool) => (
                <option key={tool.id} value={tool.id}>
                  {tool.name}
                </option>
              ))}
            </select>
            {newTaskToolIds.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {tools
                  .filter((t) => newTaskToolIds.includes(t.id))
                  .map((t) => (
                    <span
                      key={t.id}
                      className="inline-flex items-center gap-1 rounded-full bg-primary-100 px-2 py-1 text-xs text-primary-700 border border-primary-200"
                    >
                      {t.name}
                      <button
                        type="button"
                        aria-label={`Entferne ${t.name}`}
                        className="text-primary-800 hover:text-primary-900"
                        onClick={() =>
                          setNewTaskToolIds((prev) => prev.filter((id) => id !== t.id))
                        }
                      >
                        ×
                      </button>
                    </span>
                  ))}
              </div>
            )}
          </div>

          {error && <div className="mb-2 text-red-500 text-sm">{error}</div>}
          <button
            type="submit"
            disabled={isPending}
            className="self-start bg-primary-500 hover:opacity-95 shadow-sm px-4 py-2 rounded-md text-white"
          >
            {isPending ? "Speichern..." : "Hinzufügen"}
          </button>
        </form>

        {/* Filter and Sort Controls */}
        <div className="flex flex-wrap gap-3 mb-4">
          {/* FILTER */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="p-2 border rounded-md"
          >
            <option value="all">Alle Aufgaben</option>
            <option value="active">Aktiv</option>
            <option value="deleted">Gelöscht</option>
          </select>

          {/* PRIORITY FILTER */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as any)}
            className="p-2 border rounded-md"
          >
            <option>Alle</option>
            <option>Hoch</option>
            <option>Mittel</option>
            <option>Niedrig</option>
          </select>

          {/* SORT */}
          <select
            value={sort ?? ""}
            onChange={(e) => setSort(e.target.value ? "dueDate" : undefined)}
            className="p-2 border rounded-md"
          >
            <option value="">Keine Sortierung</option>
            <option value="dueDate">Nach Fälligkeitsdatum</option>
          </select>
        </div>

        {/* FMST-54 | Pachler: Filter by completion status */}
        <div className="flex gap-2 mb-4">
          <span className="text-sm text-gray-600 self-center mr-2 font-medium">Status:</span>
          {[
            { value: "all", label: "Alle Tasks" },
            { value: "open", label: "Offen" },
            { value: "completed", label: "Erledigt" },
          ].map((item) => (
            <button
              key={item.value}
              onClick={() => setFilterCompleted(item.value as typeof filterCompleted)}
              className={`px-3 py-1 rounded transition-colors ${filterCompleted === item.value
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* FMST-54 | Pachler: Active Filter Chips */}
        {(filterPriority !== "Alle" || filterCompleted !== "all" || filter !== "all" || sort) && (
          <div className="flex flex-wrap gap-2 mb-4 items-center">
            <span className="text-sm text-gray-600 font-medium">Aktive Filter:</span>

            {filterPriority !== "Alle" && (
              <div className="flex items-center gap-1 bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
                <span>Priorität: {filterPriority}</span>
                <button
                  onClick={() => setFilterPriority("Alle")}
                  className="ml-1 hover:bg-primary-200 rounded-full p-0.5 transition-colors"
                  aria-label="Filter entfernen"
                >
                  ✕
                </button>
              </div>
            )}

            {filterCompleted !== "all" && (
              <div className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                <span>Status: {filterCompleted === "open" ? "Offen" : "Erledigt"}</span>
                <button
                  onClick={() => setFilterCompleted("all")}
                  className="ml-1 hover:bg-green-200 rounded-full p-0.5 transition-colors"
                  aria-label="Filter entfernen"
                >
                  ✕
                </button>
              </div>
            )}

            {filter !== "all" && (
              <div className="flex items-center gap-1 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                <span>{filter === "active" ? "Aktiv" : "Gelöscht"}</span>
                <button
                  onClick={() => setFilter("all")}
                  className="ml-1 hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                  aria-label="Filter entfernen"
                >
                  ✕
                </button>
              </div>
            )}

            {sort && (
              <div className="flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                <span>Sortiert: Nach Fälligkeitsdatum</span>
                <button
                  onClick={() => setSort(undefined)}
                  className="ml-1 hover:bg-purple-200 rounded-full p-0.5 transition-colors"
                  aria-label="Sortierung entfernen"
                >
                  ✕
                </button>
              </div>
            )}

            <button
              onClick={() => {
                setFilterPriority("Alle");
                setFilterCompleted("all");
                setFilter("all");
                setSort(undefined);
              }}
              className="ml-2 text-sm text-gray-500 hover:text-gray-700 underline transition-colors"
            >
              Alle Filter zurücksetzen
            </button>
          </div>
        )}

        {/* FMST-75: Task Table | Rework by Pachler to show status in table */}
        <div className="overflow-x-auto">
          <table className="border border-gray-50 w-full border-collapse min-w-full">
            <thead>
              <tr className="bg-gray-200/50">
                <th className="p-2 border text-left">Status</th>
                <th className="p-2 border text-left">Priorität</th>
                <th className="p-2 border text-left">Name</th>
                <th className="p-2 border text-left">Description</th>
                <th className="p-2 border text-left">Feld</th>
                <th className="p-2 border text-left">Werkzeuge</th>
                <th className="p-2 border text-left">Due Date</th>
                <th className="p-2 border text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-4 text-gray-500 text-center italic">
                    Keine Aufgaben vorhanden.
                  </td>
                </tr>
              )}

              {tasks
                .filter((task) => filterPriority === "Alle" || task.priority === filterPriority)
                .filter((task) => {
                  if (filterCompleted === "open") return !task.completed;
                  if (filterCompleted === "completed") return task.completed;
                  return true;
                })
                .map((task) => {
                  const isDeleted = task.description === "[DELETED]";
                  return (
                    <tr
                      key={task.id}
                      className={`
                      transition-all duration-200 ease-in-out
                      ${isDeleted ? "opacity-50 bg-gray-100 text-gray-800" : ""}
                      ${task.completed && !isDeleted ? "bg-green-600 text-white hover:bg-green-700 hover:shadow-md" : "bg-white text-gray-900 hover:bg-gray-50 hover:shadow-sm"}
                      cursor-pointer
                    `}
                    >
                      <td className="p-2 border text-center">
                        {isDeleted ? (
                          "-"
                        ) : task.completed ? (
                          <span className="text-white text-2xl font-bold" title="Erledigt">✓</span>
                        ) : (
                          <span className="text-gray-400 text-xl" title="Offen">○</span>
                        )}
                      </td>
                      <td className="p-2 border">
                        {isDeleted ? (
                          "-"
                        ) : (
                          <div className="flex items-center gap-2">
                            <span
                              className={`inline-block h-3 w-3 rounded-full ${task.priority === "Hoch"
                                ? "bg-red-500"
                                : task.priority === "Niedrig"
                                  ? "bg-green-500"
                                  : "bg-yellow-400"
                                }`}
                              title={task.priority ?? "Mittel"}
                            />
                            <span className="text-sm">{task.priority ?? "Mittel"}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-2 border">{task.name}</td>
                      <td className="p-2 border">
                        {isDeleted ? "[DELETED]" : task.description || "-"}
                      </td>
                      <td className="p-2 border">
                        {isDeleted
                          ? "-"
                          : task.areaId
                            ? (areas.find((a) => a.id === task.areaId)?.name ?? "Unbekannt")
                            : "-"}
                      </td>
                      <td className="p-2 border">
                        {isDeleted
                          ? "-"
                          : (() => {
                            const assignedIds = taskTools.filter((e) => e.taskId === task.id).map((e) => e.toolId);
                            const assignedNames = assignedIds
                              .map((id) => tools.find((t) => t.id === id)?.name)
                              .filter(Boolean);
                            return assignedNames.length > 0 ? assignedNames.join(', ') : '-';
                          })()
                        }
                      </td>
                      <td className="p-2 border">
                        {isDeleted
                          ? "-"
                          : task.dueTo
                            ? new Date(task.dueTo).toLocaleDateString()
                            : "-"}
                      </td>
                      <td className="flex gap-2 p-2 border">
                        {/* FMST-54 | Pachler: Mark/Unmark as completed */}
                        {!isDeleted && (
                          <button
                            onClick={async () => {
                              const newStatus = !task.completed;
                              await markTaskCompletedAction(task.id, newStatus);
                              await fetchTasks();
                              setSuccessMessage(
                                newStatus
                                  ? `Task "${task.name}" wurde als erledigt markiert.`
                                  : `Task "${task.name}" wurde als offen markiert.`
                              );
                            }}
                            className={`px-3 py-1 rounded text-white transition-colors ${task.completed
                              ? "bg-orange-500 hover:bg-orange-600"
                              : "bg-green-600 hover:bg-green-700"
                              }`}
                          >
                            {task.completed ? "↶ Erneut öffnen" : "✓ Erledigt"}
                          </button>
                        )}

                        {/* View Button */}
                        <button
                          onClick={async () => {
                            setSelectedTask({
                              ...task,
                              area: task.areaId
                                ? (areas.find((a) => a.id === task.areaId)?.name ?? "Unbekannt")
                                : undefined,
                            });
                            setModalAreaId(task.areaId ?? "");
                            await loadToolsForTask(task.id);
                            setShowModal(true);
                          }}
                          className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-white transition-colors"
                          disabled={isDeleted}
                        >
                          View
                        </button>

                        {/* Delete Button */}
                        {!isDeleted && (
                          <button
                            onClick={() => {
                              setTaskToDelete(task);
                              setShowDeleteConfirm(true);
                            }}
                            className="before:absolute relative before:inset-0 bg-red-500 before:bg-black/10 before:opacity-0 hover:before:opacity-100 px-3 py-1 rounded text-white transition-opacity"
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
        </div>

        {/* DELETE CONFIRM MODAL */}
        {showDeleteConfirm && taskToDelete && (
          <div
            className="z-50 fixed inset-0 flex justify-center items-center bg-black/40 backdrop-blur-sm"
            onClick={() => setShowDeleteConfirm(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-white shadow-xl p-6 rounded-xl w-80 animate-fadeIn"
            >
              <h2 className="font-semibold text-gray-800 text-lg">
                Do you really want to delete the task "{taskToDelete.name}"?
              </h2>
              <p className="mt-2 text-gray-600 text-sm">This action cannot be undone.</p>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg"
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
                        setTasks((prev) =>
                          prev.map((t) =>
                            t.id === taskToDelete.id
                              ? { ...t, description: "[DELETED]", dueTo: null }
                              : t,
                          ),
                        );
                      } catch {
                        setError("Failed to delete task. Please try again.");
                      } finally {
                        setShowDeleteConfirm(false);
                        setTaskToDelete(null);
                      }
                    });
                  }}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white transition-colors"
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
            <div className="mb-4">
              <label className="block text-sm text-gray-300 mb-1">Werkzeuge zuordnen</label>
              <div className="max-h-40 overflow-auto p-2 bg-gray-900/30 rounded">
                {tools.map((t) => (
                  <label key={t.id} className="flex items-center gap-2 text-sm mb-1">
                    <input
                      type="checkbox"
                      checked={modalToolIds.includes(t.id)}
                      onChange={(e) => {
                        if (e.target.checked) setModalToolIds((s) => [...s, t.id]);
                        else setModalToolIds((s) => s.filter((id) => id !== t.id));
                      }}
                    />
                    <span>{t.name}</span>
                  </label>
                ))}
              </div>
              {/* Inline add tool form */}
              <div className="mt-3 p-2 bg-gray-900/20 rounded">
                <label className="text-xs text-gray-300">Neues Werkzeug hinzufügen</label>
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    placeholder="Name"
                    value={newToolName}
                    onChange={(e) => setNewToolName(e.target.value)}
                    className="p-1 rounded text-black"
                  />
                  <select
                    value={newToolCategory}
                    onChange={(e) => setNewToolCategory(e.target.value)}
                    className="p-1 rounded text-black"
                  >
                    <option value="Maschine">Maschine</option>
                    <option value="Handwerkzeug">Handwerkzeug</option>
                  </select>
                  <button
                    onClick={async () => {
                      if (!newToolName.trim()) return;
                      try {
                        const created = await storeTools({ name: newToolName.trim(), category: newToolCategory }, true);
                        // refresh local tools list and select the new tool
                        setTools((s) => (s ? [created, ...s] : [created]));
                        setModalToolIds((s) => [...s, created.id]);
                        setNewToolName("");
                        setNewToolCategory("Maschine");
                      } catch (err) {
                        console.error('Failed to create tool inline:', err);
                      }
                    }}
                    className="bg-secondary-100 px-2 py-1 rounded text-white"
                  >
                    Hinzufügen
                  </button>
                </div>
              </div>
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() => {
                    startTransition(async () => {
                      try {
                        // update area if changed
                        await updateTaskAction(selectedTask!.id, { areaId: modalAreaId || undefined });
                        await setTaskToolsAction(selectedTask!.id as any, modalToolIds);
                        await fetchTasks();
                        await fetchTaskTools();
                        setShowModal(false);
                      } catch (err) {
                        console.error(err);
                      }
                    });
                  }}
                  className="bg-primary-500 px-3 py-1 rounded text-white"
                >
                  Speichern
                </button>
                <button
                  onClick={() => setModalToolIds(taskTools.filter((e) => e.taskId === selectedTask!.id).map((e) => e.toolId))}
                  className="bg-secondary-100 px-3 py-1 rounded text-white"
                >
                  Zurücksetzen
                </button>
              </div>
            </div>

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

      {/* FMST-54 | Pachler: Toast Success Message - bottom left */}
      {successMessage && (
        <div className="fixed bottom-4 left-4 z-50 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg max-w-sm animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="text-xl">✓</span>
            <span className="text-sm">{successMessage}</span>
          </div>
        </div>
      )}
    </main>
  );
}
