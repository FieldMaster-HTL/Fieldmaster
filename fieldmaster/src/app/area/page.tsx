"use client";

// Area page (FMST-42 Lorenzer)
// This client component provides a form to create Areas and a list of existing Areas.
// The form includes a dropdown with predefined categories only (no free text).
// Selected category is sent to the server action createArea and displayed in the list.

import { useEffect, useState } from "react";
import Link from "next/link";
import { Area } from "../../server/db/type/DBTypes";
import { createArea, getAllAreas } from "./actions";

// Predefined category pool. Users can only choose from these values.
const AREA_CATEGORIES = [
  "WIESE",
  "ACKER",
  "OBSTGARTEN",
  "WEINBERG",
  "WALD",
  "WEIDE",
  "SONSTIGES",
];

export default function Page() {
  // Controlled inputs for the create-area form
  const [name, setName] = useState("");
  const [size, setSize] = useState<number | "">("");
  const [category, setCategory] = useState<string>(AREA_CATEGORIES[0]);

  // Local cache of areas loaded from server
  const [areas, setAreas] = useState<Area[]>([]);

  // UI error message shown when validation or network call fails
  const [error, setError] = useState<string | null>(null);

  // Reset the form fields to initial values
  const resetForm = () => {
    setName("");
    setSize("");
    setCategory(AREA_CATEGORIES[0]);
    setError(null);
  };

  // Submit handler: validates inputs, calls server action and updates local list
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Simple client-side validation for required name
    if (!name.trim()) {
      setError("Bitte einen Feldnamen eingeben.");
      return;
    }

    // Validate size is a positive number
    const numericSize = typeof size === "string" ? Number(size) : size;
    if (!numericSize || Number.isNaN(numericSize) || numericSize <= 0) {
      setError("Bitte eine gültige Größe (größer als 0) eingeben.");
      return;
    }

    try {
      // Call server action to create the area. Category is forwarded as selected.
      const { area: newArea, error } = await createArea(
        name.trim(),
        numericSize,
        category
      );

      if (error || !newArea) {
        setError(error ?? "unknown error");
        return;
      }

      // Add newly created area to local list for immediate feedback
      setAreas((prevAreas) => [...prevAreas, newArea]);

      // Clear the form
      resetForm();
    } catch (err) {
      setError("Fehler beim Anlegen des Feldes.");
      console.error("Error creating area:", err);
    }
  };

  // Load areas on component mount using the server action getAllAreas
  useEffect(() => {
    async function fetchAreas() {
      try {
        const { areas: areasRes, error } = await getAllAreas();

        if (error) {
          setError(error);
        }

        setAreas(Array.isArray(areasRes) ? areasRes : []);
      } catch (err) {
        console.error("Error fetching areas:", err);
        setError("Fehler beim Laden der Areas.");
      }
    }
    fetchAreas();
  }, []);

  // Render the form and the list of areas. The category input is a <select>,
  // preventing free-text categories and ensuring only predefined values are used.
  return (
    <div className="p-4">
      <h1 className="text-primary">Area anlegen</h1>

      <form
        onSubmit={handleSubmit}
        className="grid max-w-md gap-2"
        data-testid="area-form"
      >
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
            onChange={(e) =>
              setSize(e.target.value === "" ? "" : Number(e.target.value))
            }
            placeholder="z. B. 100"
            aria-label="Größe"
            min={0}
            className="rounded border border-gray-300 bg-gray-100 p-2 text-black"
          />
        </label>

        <label className="flex flex-col">
          <span>Kategorie</span>
          {/* Select element enforces category choices from AREA_CATEGORIES only */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded border border-gray-300 bg-gray-100 p-2 text-black"
            aria-label="Kategorie"
            required
          >
            {AREA_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <small className="text-gray-600">Nur vordefinierte Kategorien möglich.</small>
        </label>

        {error && <div className="text-red-600">{error}</div>}

        <div className="flex gap-2">
          <button
            type="submit"
            className="px-3 py-2"
            data-testid="submit-button"
          >
            Anlegen
          </button>

          <Link href="/" className="text-primary self-center">
            Zurück
          </Link>
        </div>
      </form>

      <section className="mt-6">
        <h2>Bestehende Areas</h2>
        {areas.length === 0 || !areas ? (
          <p>Keine Areas vorhanden.</p>
        ) : (
          <ul>
            {areas.map((a) => (
              <li key={a.id}>
                {a.name} — {a.size} m² —{" "}
                {/* Display stored category; default to WIESE if missing */}
                <strong>{(a as any).category ?? "WIESE"}</strong>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
