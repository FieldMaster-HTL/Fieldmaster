// FMST-7: Tasks anzeigen
// FMST-15: Areas anzeigen
// FMST-36: Dashboard anzeigen

"use client";

import React, { useEffect, useState } from "react";
import { getAllAreas } from "@/src/app/area/actions";
import { getAllTasksAction } from "@/src/app/task/actions";
import { Area, Task } from "@/src/server/db/type/DBTypes";

/**
 * Dashboard page component.
 *
 * Purpose:
 * - Load areas and tasks in parallel on mount.
 * - Present a toggle between "areas" and "tasks" views.
 * - Show loading states, empty states and an error banner on failure.
 *
 * External dependencies:
 * - getAllAreas(): expected to resolve to { areas: Area[] }
 * - getAllTasksAction(): expected to resolve to Task[]
 *
 * Notes for maintainers:
 * - Keep tests for: loading states, empty-list states, populated-list states, error handling, and toggle behavior.
 * - Date formatting uses toLocaleDateString('de-DE') for German display.
 */

/**
 * Dashboard React client component.
 * - No props.
 * - Manages local state for view, lists, loading flags and an error message.
 */
export default function Page(): React.JSX.Element {
  // UI view: either show areas or tasks
  const [view, setView] = useState<"areas" | "tasks">("areas");

  // loaded data
  const [areas, setAreas] = useState<Area[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  // loading flags for each resource
  const [loadingAreas, setLoadingAreas] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(true);

  // error text shown in a banner when any fetch fails
  const [error, setError] = useState<string | null>(null);

  // Load areas and tasks in parallel on first render.
  // The try/catch sets an error message and the finally ensures loading flags are cleared.
  useEffect(() => {
    async function load() {
      try {
        setError(null);
        setLoadingAreas(true);
        setLoadingTasks(true);

        const [{ areas }, tasksRes] = await Promise.all([getAllAreas(), getAllTasksAction()]);

        // Defensive: fallback to empty arrays if responses are falsy
        setAreas(areas || []);
        setTasks(tasksRes.tasks || []);
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err?.message ?? "Unbekannter Fehler beim Laden der Daten");
        }
        console.error("Dashboard load error:", err);
      } finally {
        setLoadingAreas(false);
        setLoadingTasks(false);
      }
    }
    load();
  }, []);

  // Render
  return (
    <main className="bg-surface flex min-h-screen items-start justify-center p-6">
      <section className="bg-elevated w-full max-w-4xl rounded-lg border p-6 shadow-md">
        <header className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-primary-500 text-2xl font-extrabold md:text-3xl">Dashboard</h1>
            <p className="text-foreground/90 mt-1 text-sm">Übersicht über Areas und Tasks</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle buttons: aria-pressed reflects the current view */}
            <button
              aria-pressed={view === "areas"}
              onClick={() => setView("areas")}
              className={`rounded-md px-4 py-2 font-medium transition ${
                view === "areas"
                  ? "bg-primary-500 text-white"
                  : "bg-surface border-primary-500/20 border"
              }`}
            >
              Areas ({areas.length})
            </button>
            <button
              aria-pressed={view === "tasks"}
              onClick={() => setView("tasks")}
              className={`rounded-md px-4 py-2 font-medium transition ${
                view === "tasks"
                  ? "bg-primary-500 text-white"
                  : "bg-surface border-primary-500/20 border"
              }`}
            >
              Tasks ({tasks.length})
            </button>
          </div>
        </header>

        <div className="mt-6">
          {/* Error banner */}
          {error && (
            <div className="mb-4 rounded-md border border-red-400 bg-red-100 p-4 text-red-700">
              Fehler: {error}
            </div>
          )}

          {/* Conditional view rendering */}
          {view === "areas" ? (
            <section>
              {loadingAreas ? (
                <div className="text-foreground/70">Areas werden geladen…</div>
              ) : areas.length === 0 ? (
                <div className="text-foreground/80">Keine Areas vorhanden.</div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {areas.map((area) => (
                    <article
                      key={area.id}
                      className="bg-surface border-primary-500/10 hover:border-primary-500/30 rounded-md border p-4 transition"
                    >
                      <h3 className="text-primary-500 text-lg font-semibold">{area.name}</h3>
                      <p className="text-foreground/90 mt-2 text-sm">
                        Größe: <span className="font-medium">{area.size} m²</span>
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </section>
          ) : (
            <section>
              {loadingTasks ? (
                <div className="text-foreground/70">Tasks werden geladen…</div>
              ) : tasks.length === 0 ? (
                <div className="text-foreground/80">Keine Tasks vorhanden.</div>
              ) : (
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-surface border-primary-500/10 hover:border-primary-500/30 rounded-md border p-4 transition"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h4 className="text-foreground font-semibold">{task.name}</h4>
                          {task.description && (
                            <p className="text-foreground/90 mt-1 text-sm">{task.description}</p>
                          )}
                        </div>
                        {task.dueTo && (
                          <span className="text-foreground/70 text-xs whitespace-nowrap">
                            Fällig: {new Date(task.dueTo).toLocaleDateString("de-DE")}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </section>
    </main>
  );
}
