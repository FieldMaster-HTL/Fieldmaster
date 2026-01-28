"use client";

// Area page (merged bernd_branch + integration_branch)
// Includes: create form, simple list view, enhanced table view with edit/delete modals.

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Area } from "../../server/db/type/DBTypes";
import * as AreaActions from "./actions";

const AREA_CATEGORIES = [
  "WIESE",
  "ACKER",
  "OBSTGARTEN",
  "WEINBERG",
  "WALD",
  "WEIDE",
  "SONSTIGES",
];
// Types for safe action results
type CreateAreaResult = { area: Area | null; error?: string | null };
type GetAllAreasResult = { areas?: Area[] | null; error?: string | null };
type UpdateAreaResult = { area: Area | null; error?: string | null };
type DeleteAreaResult = { success: boolean; error?: string | null };

// Safe wrappers for action functions. If the named export doesn't exist
// (e.g., during partial merges), use a no-op/fallback with proper types to
// avoid `any` and unused-variable lint errors.
const createAreaFn: (name: string, size: number, category: string) => Promise<CreateAreaResult> = ((AreaActions as any).createArea ?? (async (_name: string, _size: number, _category: string) => {
  void _name; void _size; void _category;
  return { area: null, error: 'createArea not available' };
})) as (name: string, size: number, category: string) => Promise<CreateAreaResult>;

const getAllAreasFn: () => Promise<GetAllAreasResult> = ((AreaActions as any).getAllAreas ?? (async () => ({ areas: [] as Area[], error: null }))) as () => Promise<GetAllAreasResult>;

const updateAreaFn: (id: string, name: string, size: number) => Promise<UpdateAreaResult> = (((AreaActions as any).updateArea) ?? (async (_id: string, _name: string, _size: number) => {
  void _id; void _name; void _size;
  return { area: null, error: 'updateArea not available' };
})) as (id: string, name: string, size: number) => Promise<UpdateAreaResult>;

const deleteAreaFn: (id: string) => Promise<DeleteAreaResult> = (((AreaActions as any).deleteArea) ?? (async (_id: string) => {
  void _id;
  return { success: false, error: 'deleteArea not available' };
})) as (id: string) => Promise<DeleteAreaResult>;

export default function Page(): React.JSX.Element {
  // Form state
  const [name, setName] = useState("");
  const [size, setSize] = useState<number | "">("");
  const [category, setCategory] = useState<string>(AREA_CATEGORIES[0]);

  // Data & UI state
  const [areas, setAreas] = useState<Area[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "table">("list");

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Bitte einen Feldnamen eingeben.");
      return;
    }

    const numericSize = typeof size === "string" ? Number(size) : size;
    if (!numericSize || Number.isNaN(numericSize) || numericSize <= 0) {
      setError("Bitte eine gültige Größe (größer als 0) eingeben.");
      return;
    }

    try {
      const { area: newArea, error: createErr } = await createAreaFn(name.trim(), numericSize, category);
      if (createErr || !newArea) {
        setError(createErr ?? "Fehler beim Anlegen des Feldes.");
        return;
      }
      setAreas((prev) => [...prev, newArea]);
      resetForm();
      setSuccessMessage("Area erfolgreich angelegt.");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Error creating area:", err);
      setError("Fehler beim Anlegen des Feldes.");
    }
  };

  useEffect(() => {
    let mounted = true;
    async function fetchAreas() {
      try {
        const { areas: areasRes, error: getErr } = await getAllAreasFn();
        if (!mounted) return;
        if (getErr) setError(getErr);
        setAreas(Array.isArray(areasRes) ? areasRes : []);
      } catch (err) {
        console.error("Error fetching areas:", err);
        if (!mounted) return;
        setError("Fehler beim Laden der Areas.");
      }
    }
    fetchAreas();
    return () => { mounted = false; };
  }, []);

  // Modal helpers
  const openModal = (a: Area) => {
    setSelectedArea(a);
    setEditName(a.name);
    setEditSize(a.size ?? "");
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
    try {
      setError(null);
      const { success, error: delErr } = await deleteAreaFn(id);
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
  };

  return (
    <div className="p-4">
      <h1 className="text-primary">Area anlegen</h1>

      <form onSubmit={handleSubmit} className="grid max-w-md gap-2" data-testid="area-form">
        <label className="flex flex-col">
          <span>Feldname</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="z. B. Acker 1" aria-label="Feldname" className="rounded border border-gray-300 bg-gray-100 p-2 text-black" />
        </label>

        <label className="flex flex-col">
          <span>Größe (m²)</span>
          <input type="number" value={size} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSize(e.target.value === "" ? "" : Number(e.target.value))} placeholder="z. B. 100" aria-label="Größe" min={0} className="rounded border border-gray-300 bg-gray-100 p-2 text-black" />
        </label>

        <label className="flex flex-col">
          <span>Kategorie</span>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded border border-gray-300 bg-gray-100 p-2 text-black" aria-label="Kategorie" required>
            {AREA_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <small className="text-gray-600">Nur vordefinierte Kategorien möglich.</small>
        </label>

        {error && <div className="text-red-600">{error}</div>}

        <div className="flex gap-2">
          <button type="submit" className="px-3 py-2" data-testid="submit-button">Anlegen</button>
          <Link href="/" className="text-primary self-center">Zurück</Link>
        </div>
      </form>

      {/* view mode toggle to preserve both UI variants */}
      <div className="mt-6 flex gap-2 items-center">
        <label className="text-sm">Ansicht:</label>
        <button onClick={() => setViewMode('list')} className={`px-2 py-1 rounded ${viewMode === 'list' ? 'bg-primary-500 text-white' : 'bg-surface'}`}>Liste</button>
        <button onClick={() => setViewMode('table')} className={`px-2 py-1 rounded ${viewMode === 'table' ? 'bg-primary-500 text-white' : 'bg-surface'}`}>Tabelle</button>
      </div>

      {viewMode === 'list' ? (
        <section className="mt-4">
          <h2>Bestehende Areas</h2>
          {areas.length === 0 ? (
            <p>Keine Areas vorhanden.</p>
          ) : (
            <ul>
              {areas.map((a) => (
                <li key={a.id} className="py-1">{a.name} — {a.size} m² — <strong>{(a as Area & { category?: string }).category ?? 'WIESE'}</strong></li>
              ))}
            </ul>
          )}
        </section>
      ) : (
        <section className="mt-4">
          <h2>Bestehende Areas</h2>
          {areas.length === 0 ? (
            <p>Keine Areas vorhanden.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 bg-white" data-testid="areas-table" role="table" aria-label="Areas Tabelle">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Größe (m²)</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ID</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aktionen</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {areas.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm text-gray-900">{a.name}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{a.size} m²</td>
                      <td className="px-4 py-2 text-sm text-gray-500">{a.id}</td>
                      <td className="px-4 py-2 text-sm">
                        <button onClick={() => openModal(a)} className="text-blue-600 hover:underline mr-3" aria-label={`Bearbeite ${a.name}`}>Bearbeiten</button>
                        <button onClick={() => handleDeleteClick(a.id)} className="text-red-600 hover:underline" aria-label={`Lösche ${a.name}`} data-testid={`delete-button-${a.id}`}>Löschen</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* Edit modal */}
      {showModal && selectedArea && (
        <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/60">
          <div className="relative bg-white shadow-xl p-6 rounded-md w-full max-w-md">
            <button onClick={closeModal} className="top-2 right-3 absolute text-gray-500">✕</button>
            <h2 className="mb-4 font-bold text-lg">Area bearbeiten</h2>

            <label className="flex flex-col mb-4">
              <span className="mb-2 text-sm">Feldname</span>
              <input value={editName} onChange={(e) => setEditName(e.target.value)} className="rounded border p-2" />
            </label>

            <label className="flex flex-col mb-4">
              <span className="mb-2 text-sm">Größe (m²)</span>
              <input type="number" value={editSize} onChange={(e) => setEditSize(e.target.value === "" ? "" : Number(e.target.value))} className="rounded border p-2" />
            </label>

            <div className="pt-2 border-t mt-2 text-sm text-gray-600 mb-4"><p>ID: {selectedArea.id}</p></div>

            <div className="flex gap-2">
              <button onClick={async () => {
                if (!editName.trim()) { setError('Bitte einen Feldnamen eingeben.'); return; }
                const numericSize = typeof editSize === 'string' ? Number(editSize) : editSize;
                if (!numericSize || Number.isNaN(numericSize) || numericSize <= 0) { setError('Bitte eine gültige Größe eingeben.'); return; }
                try {
                  const { area: updatedArea, error: updateErr } = await updateAreaFn(selectedArea.id, editName.trim(), numericSize);
                  if (updateErr || !updatedArea) { setError(updateErr ?? 'Fehler beim Speichern.'); return; }
                  setAreas((prev) => prev.map((a) => (a.id === updatedArea.id ? updatedArea : a)));
                  closeModal();
                  setSuccessMessage('Area erfolgreich gespeichert.');
                  setTimeout(() => setSuccessMessage(null), 3000);
                } catch (err) {
                  console.error('Error updating area:', err);
                  setError('Fehler beim Speichern des Feldes.');
                }
              }} className="px-3 py-2 bg-gray-800 text-white rounded">Speichern</button>
              <button onClick={closeModal} className="px-3 py-2 bg-gray-200 rounded">Abbrechen</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "24px",
              borderRadius: "8px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              textAlign: "center",
              maxWidth: "400px",
            }}
            role="dialog"
            aria-modal="true"
          >
            <h3 style={{ marginTop: 0, marginBottom: "16px", color: "#333" }}>Area löschen?</h3>
            <p style={{ marginBottom: "24px", color: "#666" }}>
              Möchtest du die Area &quot;{areas.find((x) => x.id === deletingId)?.name}&quot; wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
              <button
                onClick={() => confirmDelete(deletingId)}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
                data-testid={`confirm-delete-${deletingId}`}
              >
                Löschen
              </button>
              <button
                onClick={cancelDelete}
                style={{
                  padding: "8px 16px",
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "14px",
                }}
                data-testid={`cancel-delete-${deletingId}`}
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
