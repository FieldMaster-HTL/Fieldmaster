"use client";

//Area FMST-30  / FMST-31
import { useEffect, useState } from "react";
import Link from "next/link";
import { Area } from "../../server/db/type/DBTypes";
import { createArea, getAllAreas } from "../area/actions";

export default function Page() {
  const [name, setName] = useState("");
  const [size, setSize] = useState<number | "">("");
  const [areas, setAreas] = useState<Area[]>([]);
  const [error, setError] = useState<string | null>(null);

  const resetForm = () => {
    setName("");
    setSize("");
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
      const { area: newArea, error } = await createArea(name.trim(), numericSize);

      if (error || !newArea) {
        setError(error ?? "unknown error");
        return;
      }

      setAreas((prevAreas) => [...prevAreas, newArea]);

      resetForm();
    } catch (err) {
      setError("Fehler beim Anlegen des Feldes.");
      console.error("Error creating area:", err);
    }
  };
  useEffect(() => {
    async function fetchAreas() {
      try {
        const { areas: areasRes, error } = await getAllAreas();

        if (error) {
          setError(error);
        }

        // Ensure we set an array — fall back to an empty array if the response is not an array
        setAreas(Array.isArray(areasRes) ? areasRes : []);
      } catch (err) {
        console.error("Error fetching areas:", err);
        setError("Fehler beim Laden der Areas.");
      }
    }
    fetchAreas();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-primary">Area anlegen</h1>

      <form onSubmit={handleSubmit} className="grid max-w-md gap-2" data-testid="area-form">
        <label className="flex flex-col">
          <span>Feldname</span>

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="z. B. Acker 1"
            aria-label="Feldname"
            className="rounded border border-gray-300 bg-gray-100 p-2 text-black"
          />
        </label>

        <label className="flex flex-col">
          <span>Größe (m²)</span>

          <input
            type="number"
            value={size}
            onChange={(e) => setSize(e.target.value === "" ? "" : Number(e.target.value))}
            placeholder="z. B. 100"
            aria-label="Größe"
            min={0}
            className="rounded border border-gray-300 bg-gray-100 p-2 text-black"
          />
        </label>

        {error && <div className="text-red-600">{error}</div>}

        <div className="flex gap-2">
          <button type="submit" className="px-3 py-2" data-testid="submit-button">
            Anlegen
          </button>

          <Link href="/" className="text-primary self-center">
            Zurück
          </Link>
        </div>
      </form >
      {/*FMST-74 Mauerhofer*/}
      < section className="mt-6" >
        <h2>Bestehende Tasks</h2>

        {
          areas.length === 0 ? (
            <p>Keine Tasks vorhanden.</p>
          ) : (
            <div className="overflow-x-auto">
              <table
                className="min-w-full divide-y divide-gray-700 bg-black text-white"
                data-testid="areas-table"
                role="table"
                aria-label="Tasks Tabelle"
              >
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Größe (m²)
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Aktionen
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-black divide-y divide-gray-700">
                  {areas.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-800">
                      <td className="px-4 py-2 text-sm text-gray-100">{a.name}</td>
                      <td className="px-4 py-2 text-sm text-gray-100">{a.size} m²</td>
                      <td className="px-4 py-2 text-sm text-gray-400">{a.id}</td>
                      <td className="px-4 py-2 text-sm">
                        <button
                          onClick={() => openModal(a)}
                          className="text-blue-300 hover:underline mr-3"
                          aria-label={`Bearbeite ${a.name}`}
                        >
                          Bearbeiten
                        </button>

                        <button
                          onClick={() => handleDeleteClick(a.id)}
                          className="text-red-400 hover:underline"
                          aria-label={`Lösche ${a.name}`}
                          data-testid={`delete-button-${a.id}`}
                        >
                          Löschen
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
      </section >
      {/*FMST-43 */}
      {/* Area Detail Modal */}
      {
        showModal && selectedArea && (
          <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/60 backdrop-blur-sm">
            <div className="relative bg-linear-to-br from-primary-900 via-gray-800 to-secondary-800 shadow-2xl p-6 border border-gray-700 rounded-2xl w-full max-w-md text-white">
              <button
                onClick={closeModal}
                className="top-2 right-3 absolute text-gray-400 hover:text-white text-2xl"
              >
                ✕
              </button>

              <h2 className="mb-4 font-bold text-primary-400 text-2xl">Area bearbeiten</h2>

              <label className="flex flex-col mb-4">
                <span className="text-gray-300 mb-2">Feldname</span>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="rounded border border-gray-300 bg-gray-100 p-2 text-black"
                />
              </label>

              <label className="flex flex-col mb-4">
                <span className="text-gray-300 mb-2">Größe (m²)</span>
                <input
                  type="number"
                  value={editSize}
                  onChange={(e) => setEditSize(e.target.value === "" ? "" : Number(e.target.value))}
                  className="rounded border border-gray-300 bg-gray-100 p-2 text-black"
                />
              </label>

              <div className="pt-2 border-gray-700 border-t text-gray-400 text-xs mb-4">
                <p>ID: {selectedArea.id}</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    if (!editName.trim()) {
                      setError("Bitte einen Feldnamen eingeben.");
                      return;
                    }
                    const numericSize = typeof editSize === "string" ? Number(editSize) : editSize;
                    if (!numericSize || Number.isNaN(numericSize) || numericSize <= 0) {
                      setError("Bitte eine gültige Größe eingeben.");
                      return;
                    }
                    try {
                      const { area: updatedArea, error } = await updateArea(selectedArea.id, editName.trim(), numericSize);
                      if (error || !updatedArea) {
                        setError(error ?? "unknown error");
                        return;
                      }
                      setAreas((prevAreas) => prevAreas.map((a) => (a.id === updatedArea.id ? updatedArea : a)));
                      closeModal();
                      setSuccessMessage("Area erfolgreich gespeichert.");
                      setTimeout(() => setSuccessMessage(null), 3000);
                    } catch (err) {
                      setError("Fehler beim Speichern des Feldes.");
                      console.error("Error updating area:", err);
                    }
                  }}
                  className="px-3 py-2 bg-gray-600 rounded text-white"
                >
                  Speichern
                </button>
                <button onClick={closeModal} className="px-3 py-2 bg-gray-600 rounded text-white">
                  Abbrechen
                </button>
              </div>
            </div>
          </div>
        )
      }

      {/* Delete Confirmation Modal */}
      {
        deletingId && (
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
                Möchtest du die Area "{areas.find((x) => x.id === deletingId)?.name}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
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
        )
      }
    </div >
  );
}
