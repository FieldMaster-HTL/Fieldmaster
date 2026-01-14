//FMST-35

"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { getAllTasksAction, createTaskAction, deleteTaskAction, getTasksSortedFilteredAction, getAllToolsAction, getAllTaskToolsAction, getToolsForTaskAction, setTaskToolsAction, updateTaskAction } from "./actions";
import { storeTools } from "../tools/actions";
import { getAllAreas } from "../area/actions";
// Task type is not exported from DBTypes; use `any` here for client state

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
  // Tools state (FMST-12)
  const [tools, setTools] = useState<any[]>([]);
  const [taskTools, setTaskTools] = useState<any[]>([]);
  const [modalToolIds, setModalToolIds] = useState<string[]>([]);
  const [modalAreaId, setModalAreaId] = useState("");
  const [newToolName, setNewToolName] = useState("");
  const [newToolCategory, setNewToolCategory] = useState("Maschine");

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
        const created = await createTaskAction(newTaskName, newTaskDescription, creatorClerkId, dueDate, newTaskAreaId || undefined);
        // assign selected tools to the newly created task
        if (created && newTaskToolIds && newTaskToolIds.length > 0) {
          try {
            await setTaskToolsAction(created.id as any, newTaskToolIds);
          } catch (err) {
            console.error('Failed to set tools for new task:', err);
          }
        }
        await fetchTasks();
        setNewTaskName("");
        setNewTaskDescription("");
        setDueTo("");
        setNewTaskAreaId(""); // FMST-11
        setNewTaskToolIds([]);
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
          <select
            value={newTaskToolIds}
            onChange={(e) => setNewTaskToolIds(e.target.value.split(","))}
            className="p-2 border rounded-md"
            aria-label="Werkzeuge auswählen (optional)"
          >
            <option value="">-- Werkzeuge auswählen (optional) --</option>
            {tools.map((tool) => (
              <option key={tool.id} value={tool.id}>
                {tool.name}
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

          {/* SORT */}
          <select
            value={sort ?? ""}
            onChange={(e) =>
              setSort(e.target.value ? "dueDate" : undefined)
            }
            className="p-2 border rounded-md"
          >
            <option value="">Keine Sortierung</option>
            <option value="dueDate">Nach Fälligkeitsdatum</option>
          </select>
        </div>

        {/* FMST-75: Task Table */}
        <table className="border border-gray-50 w-full border-collapse">
          <thead>
            <tr className="bg-gray-200/50">
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
                <td colSpan={5} className="p-4 text-gray-500 text-center italic">
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
                  <td className="p-2 border">{task.name}</td>
                  <td className="p-2 border">{isDeleted ? "[DELETED]" : task.description || "-"}</td>
                  <td className="p-2 border">
                    {isDeleted ? "-" : task.areaId ? (areas.find((a) => a.id === task.areaId)?.name ?? "Unbekannt") : "-"}
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
                    <td className="p-2 border">{isDeleted ? "-" : task.dueTo ? new Date(task.dueTo).toLocaleDateString() : "-"}</td>
                  <td className="flex gap-2 p-2 border">
                    {/* View Button */}
                    <button
                      onClick={async () => {
                        setSelectedTask({
                          ...task,
                          area: task.areaId ? (areas.find((a) => a.id === task.areaId)?.name ?? "Unbekannt") : undefined,
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
                        onClick={() => { setTaskToDelete(task); setShowDeleteConfirm(true); }}
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
    </main>
  );
}
