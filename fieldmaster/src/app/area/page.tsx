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
      </form>

      <section className="mt-6">
        <h2>Bestehende Areas</h2>
        {areas.length === 0 || !areas ? (
          <p>Keine Areas vorhanden.</p>
        ) : (
          <ul>
            {areas.map((a) => (
              <li key={a.id}>
                {a.name} — {a.size} m²
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
