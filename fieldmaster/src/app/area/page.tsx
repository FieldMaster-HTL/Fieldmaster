"use client";

import React, { useEffect, useState, useTransition, useCallback } from "react";
import Link from "next/link";
import { Area } from "../../server/db/type/DBTypes";
import { createArea, getAllAreas, updateArea, deleteArea } from "./actions";

// Constants for categories
const AREA_CATEGORIES = [
  "WIESE",
  "ACKER",
  "OBSTGARTEN",
  "WEINBERG",
  "WALD",
  "WEIDE",
  "SONSTIGES",
];

export default function Page(): React.JSX.Element {
  // Form state
  const [name, setName] = useState("");
  const [size, setSize] = useState<number | "">("");
  const [category, setCategory] = useState<string>(AREA_CATEGORIES[0]);

  // Data & UI state
  const [areas, setAreas] = useState<Area[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "table">("table");
  const [isPending, startTransition] = useTransition();

  // Modal / edit state
  const [showModal, setShowModal] = useState(false);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [editName, setEditName] = useState("");
  const [editSize, setEditSize] = useState<number | "">("");

  // Delete confirmation
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const resetForm = () => {
    setName("");
    setSize("");
    setCategory(AREA_CATEGORIES[0]);
    setError(null);
  };

  const fetchAreas = useCallback(async () => {
    try {
      const { areas: areasRes, error: getErr } = await getAllAreas();
      if (getErr) {
        setError(getErr);
      } else {
        setAreas(Array.isArray(areasRes) ? areasRes : []);
      }
    } catch (err) {
      console.error("Error fetching areas:", err);
      setError("Fehler beim Laden der Areas.");
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchAreas();
  }, [fetchAreas]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!name.trim()) {
      setError("Bitte einen Feldnamen eingeben.");
      return;
    }

    const numericSize = typeof size === "string" ? Number(size) : size;
    if (!numericSize || Number.isNaN(numericSize) || numericSize <= 0) {
      setError("Bitte eine gültige Größe (größer als 0) eingeben.");
      return;
    }

    startTransition(async () => {
      try {
        const { area: newArea, error: createErr } = await createArea(
          name.trim(),
          numericSize,
          category
        );
        if (createErr || !newArea) {
          setError(createErr ?? "Fehler beim Anlegen des Feldes.");
          return;
        }
        await fetchAreas();
        resetForm();
        setSuccessMessage("Area erfolgreich angelegt.");
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (err) {
        console.error("Error creating area:", err);
        setError("Fehler beim Anlegen des Feldes.");
      }
    });
  };

  // Modal helpers
  const openModal = (a: Area) => {
    setSelectedArea(a);
    setEditName(a.name);
    setEditSize(a.size);
    setShowModal(true);
    setError(null);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedArea(null);
    setEditName("");
    setEditSize("");
    setError(null);
  };

  // Delete flow
  const handleDeleteClick = (id: string) => setDeletingId(id);
  const cancelDelete = () => setDeletingId(null);

  const confirmDelete = async (id: string | null) => {
    if (!id) return;
    startTransition(async () => {
      try {
        setError(null);
        const { success, error: delErr } = await deleteArea(id);
        if (!success) {
          setError(delErr ?? "Fehler beim Löschen der Area.");
          setDeletingId(null);
          return;
        }
        setAreas((prev) => prev.filter((a) => a.id !== id));
        if (selectedArea?.id === id) closeModal();
        setSuccessMessage("Area erfolgreich gelöscht.");
        setDeletingId(null);
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (err) {
        console.error("Error deleting area:", err);
        setError("Fehler beim Löschen der Area.");
        setDeletingId(null);
      }
    });
  };

  const handleUpdate = async () => {
    if (!selectedArea) return;
    if (!editName.trim()) {
      setError("Bitte einen Feldnamen eingeben.");
      return;
    }
    const numericSize =
      typeof editSize === "string" ? Number(editSize) : editSize;
    if (!numericSize || Number.isNaN(numericSize) || numericSize <= 0) {
      setError("Bitte eine gültige Größe eingeben.");
      return;
    }

    startTransition(async () => {
      try {
        const { area: updatedArea, error: updateErr } = await updateArea(
          selectedArea.id,
          editName.trim(),
          numericSize
        );
        if (updateErr || !updatedArea) {
          setError(updateErr ?? "Fehler beim Speichern.");
          return;
        }
        setAreas((prev) =>
          prev.map((a) => (a.id === updatedArea.id ? updatedArea : a))
        );
        closeModal();
        setSuccessMessage("Area erfolgreich gespeichert.");
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (err) {
        console.error("Error updating area:", err);
        setError("Fehler beim Speichern des Feldes.");
      }
    })
  };

  return (
    <main className="flex justify-center items-center bg-surface p-6 min-h-screen">
      <section className="relative bg-elevated shadow-md p-8 border rounded-lg w-full max-w-3xl">
        <header className="flex md:flex-row flex-col md:justify-between md:items-center gap-4 mb-6">
          <div>
            <h1 className="font-extrabold text-primary-500 text-3xl md:text-4xl">Areas</h1>
            <p className="mt-2 text-foreground/90 text-sm">
              Verwaltung deiner Felder und Flächen.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="inline-block bg-secondary-100 px-4 py-2 border border-secondary-500 rounded-md text-white"
            >
              Zurück
            </Link>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-col gap-2 mb-6" data-testid="area-form">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="z. B. Acker 1"
            aria-label="Feldname"
            className="p-2 border rounded-md"
          />

          <input
            type="number"
            value={size}
            onChange={(e) =>
              setSize(e.target.value === "" ? "" : Number(e.target.value))
            }
            placeholder="Größe (m²)"
            aria-label="Größe"
            min={0}
            className="p-2 border rounded-md"
          />

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="p-2 border rounded-md"
            aria-label="Kategorie"
            required
          >
            {AREA_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {error && <div className="text-red-600 text-sm mb-2">{error}</div>}
          {successMessage && <div className="text-green-600 text-sm mb-2">{successMessage}</div>}

          <button
            type="submit"
            disabled={isPending}
            className="self-start bg-primary-500 hover:opacity-95 shadow-sm px-4 py-2 rounded-md text-white"
            data-testid="submit-button"
          >
            {isPending ? "Lädt..." : "Anlegen"}
          </button>
        </form>

        <div className="flex gap-2 mb-4 items-center">
          <label className="text-sm">Ansicht:</label>
          <button
            onClick={() => setViewMode("list")}
            className={`px-3 py-1 rounded text-sm ${viewMode === "list"
                ? "bg-primary-500 text-white"
                : "bg-gray-200 text-gray-800"
              }`}
          >
            Liste
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`px-3 py-1 rounded text-sm ${viewMode === "table"
                ? "bg-primary-500 text-white"
                : "bg-gray-200 text-gray-800"
              }`}
          >
            Tabelle
          </button>
        </div>

        {viewMode === "list" ? (
          <section className="mt-4">
            <h2 className="text-lg font-semibold mb-2">Bestehende Areas</h2>
            {areas.length === 0 ? (
              <p className="text-gray-500 italic">Keine Areas vorhanden.</p>
            ) : (
              <ul className="divide-y divide-gray-100">
                {areas.map((a) => (
                  <li key={a.id} className="py-2 flex justify-between items-center">
                    <span>
                      {a.name} — {a.size} m² —{" "}
                      <strong>{a.category}</strong>
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openModal(a)}
                        className="text-blue-600 hover:underline text-sm"
                      >
                        Bearbeiten
                      </button>
                      <button
                        onClick={() => handleDeleteClick(a.id)}
                        className="text-red-600 hover:underline text-sm"
                      >
                        Löschen
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : (
          <div className="overflow-x-auto border border-gray-50 rounded bg-white">
            <table
              className="w-full border-collapse"
              data-testid="areas-table"
              role="table"
              aria-label="Areas Tabelle"
            >
              <thead className="bg-gray-200/50">
                <tr>
                  <th className="p-2 border text-left text-sm text-gray-600">Name</th>
                  <th className="p-2 border text-left text-sm text-gray-600">Größe (m²)</th>
                  <th className="p-2 border text-left text-sm text-gray-600">Kategorie</th>
                  <th className="p-2 border text-left text-sm text-gray-600">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {areas.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-4 text-gray-500 text-center italic">
                      Keine Areas vorhanden.
                    </td>
                  </tr>
                ) : (
                  areas.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-2 border text-sm text-gray-900">{a.name}</td>
                      <td className="p-2 border text-sm text-gray-900">{a.size}</td>
                      <td className="p-2 border text-sm text-gray-900">{a.category}</td>
                      <td className="p-2 border text-sm flex gap-2">
                        <button
                          onClick={() => openModal(a)}
                          className="bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded text-white text-xs transition-colors"
                          aria-label={`Bearbeite ${a.name}`}
                        >
                          Bearbeiten
                        </button>
                        <button
                          onClick={() => handleDeleteClick(a.id)}
                          className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-white text-xs transition-colors"
                          aria-label={`Lösche ${a.name}`}
                          data-testid={`delete-button-${a.id}`}
                        >
                          Löschen
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Edit modal */}
      {showModal && selectedArea && (
        <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/60 backdrop-blur-sm">
          <div className="relative bg-white shadow-xl p-6 rounded-md w-full max-w-md">
            <button
              onClick={closeModal}
              className="top-2 right-3 absolute text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>
            <h2 className="mb-4 font-bold text-lg text-gray-800">Area bearbeiten</h2>

            <label className="flex flex-col mb-4">
              <span className="mb-2 text-sm font-medium text-gray-700">Feldname</span>
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="rounded border p-2 w-full"
              />
            </label>

            <label className="flex flex-col mb-4">
              <span className="mb-2 text-sm font-medium text-gray-700">Größe (m²)</span>
              <input
                type="number"
                value={editSize}
                onChange={(e) =>
                  setEditSize(e.target.value === "" ? "" : Number(e.target.value))
                }
                className="rounded border p-2 w-full"
              />
            </label>

            <div className="pt-2 border-t mt-2 text-sm text-gray-500 mb-4">
              <p>ID: {selectedArea.id}</p>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-200 rounded text-gray-800 hover:bg-gray-300 transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleUpdate}
                disabled={isPending}
                className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 transition-colors"
              >
                {isPending ? "Speichern..." : "Speichern"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div
          className="z-50 fixed inset-0 flex justify-center items-center bg-black/40 backdrop-blur-sm"
          onClick={cancelDelete}
        >
          <div
            className="bg-white shadow-xl p-6 rounded-xl w-80 animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <h3 className="font-semibold text-gray-800 text-lg mb-4">
              Area löschen?
            </h3>
            <p className="mb-6 text-gray-600 text-sm">
              Möchtest du die Area &quot;{areas.find((x) => x.id === deletingId)?.name}&quot; wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDelete}
                className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg text-sm"
                data-testid={`cancel-delete-${deletingId}`}
              >
                Abbrechen
              </button>
              <button
                onClick={() => confirmDelete(deletingId)}
                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white transition-colors text-sm"
                data-testid={`confirm-delete-${deletingId}`}
              >
                Löschen
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
