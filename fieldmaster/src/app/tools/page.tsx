"use client"; // Markiert diese Datei als Client Component in Next.js (wird im Browser ausgeführt)
import { useState, useEffect } from "react";
import { Tool } from "../../server/db/type/DBTypes";
import { loadTools, storeTools, updateTool } from "./actions";
import "./style.css";

// Import von asynchronen Funktionen zur Datenbank-Interaktion

export default function Page() {
  // React State Hooks:
  const [tools, setTools] = useState<Tool[]>([]); // Liste der gespeicherten Tools
  const [showWindow, setShowWindow] = useState(false); // Steuert, ob das Modal-Fenster angezeigt wird
  const [form, setForm] = useState({ name: "", category: "Maschine" }); // Formularzustand für neues Tool
  const [showModal, setShowModal] = useState(false); // Steuert, ob das Bearbeitungs-Modal angezeigt wird
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null); // Ausgewähltes Tool für Bearbeitung
  const [editName, setEditName] = useState(""); // Bearbeiteter Name
  const [editCategory, setEditCategory] = useState("Maschine"); // Bearbeitete Kategorie
  const [editAvailable, setEditAvailable] = useState(false); // Bearbeiteter Verfügbarkeitsstatus
  const [error, setError] = useState<string | null>(null); // Fehlermeldung
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // Erfolgsmeldung

  // Lädt die Tools beim ersten Rendern der Seite

  // Asynchrone Funktion, um Tools aus der Datenbank zu laden
  async function loadToolsfromDB() {
    try {
      const data = await loadTools();
      setTools(data);
    } catch (error) {
      console.error("Failed to load tools:", error);
      setError("Fehler beim Laden der Tools.");
    }
  }

  useEffect(() => {
    const fetchTools = () => {
      loadToolsfromDB();
    };
    fetchTools();
  }, []);

  // Formular absenden
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Bitte gib einen Tool-Namen ein.");
      return;
    }

    try {
      await storeTools(form, true);
    } catch (error) {
      console.error("Failed to create tool:", error);
      alert("Fehler beim Erstellen des Tools.");
      return;
    }

    setForm({ name: "", category: "Maschine" });
    setShowWindow(false);

    await loadToolsfromDB();
  }

  // Modal öffnen
  const openModal = (tool: Tool) => {
    setSelectedTool(tool);
    setEditName(tool.name);
    setEditCategory(tool.category);
    setEditAvailable(tool.available);
    setShowModal(true);
    setError(null);
  };

  // Modal schließen
  const closeModal = () => {
    setShowModal(false);
    setSelectedTool(null);
    setEditName("");
    setEditCategory("Maschine");
    setEditAvailable(false);
    setError(null);
  };

  // FMST-46 Mauerhofer
  const handleSaveEdit = async () => {
    if (!editName.trim()) {
      setError("Bitte einen Tool-Namen eingeben.");
      return;
    }
    if (!editCategory.trim()) {
      setError("Bitte eine Kategorie wählen.");
      return;
    }

    if (!selectedTool) return;

    try {
      const { tool: updatedTool, error: updateError } = await updateTool(
        selectedTool.id,
        editName.trim(),
        editCategory.trim(),
        editAvailable
      );

      if (updateError || !updatedTool) {
        setError(updateError ?? "unknown error");
        return;
      }

      setTools((prevTools) =>
        prevTools.map((t) => (t.id === updatedTool.id ? updatedTool : t))
      );
      closeModal();
      setSuccessMessage("Tool erfolgreich gespeichert.");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Error updating tool:", err);
      setError("Fehler beim Speichern des Tools.");
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Tools</h1>

      {/* Erfolgsmeldung */}
      {successMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}

      {/* Fehlermeldung */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* BUTTON zum Öffnen des Erstellungsfensters */}
      <button onClick={() => setShowWindow(true)} className="create-button">
        Create Tool
      </button>

      {/* FMST-16: Werkzeug - Maschinen/Werkzeuge anzeigen 
          (Kulmer Klara) */}
      <ul className="tool-names">
        {tools.map((tool) => (
          <li key={tool.id}>{tool.name}</li>
        ))}
      </ul>

      {/* MODAL-FENSTER zum Erstellen eines neuen Tools */}
      {showWindow && (
        <div className="modal-overlay">
          <div className="modal-window">
            <h2 className="modal-title">Neues Tool erstellen</h2>

            {/* Formular für Name + Kategorie */}
            <form onSubmit={handleSubmit} className="modal-form">
              {/* 
                FMST-17: Werkzeug - Name wählen 
                (Kulmer Klara)
              */}
              <input
                type="text"
                placeholder="Tool-Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="modal-input"
              />

              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="modal-select"
              >
                <option value="Maschine">Maschine</option>
                <option value="Handwerkzeug">Handwerkzeug</option>
              </select>

              {/* Buttons im Modal */}
              <div className="modal-buttons">
                <button type="submit" className="modal-save">
                  Speichern
                </button>
                <button type="button" onClick={() => setShowWindow(false)} className="modal-cancel">
                  Abbrechen
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FMST-18: Werkzeug - Beschreibung mit Bearbeiten/Löschen */}
      {/* Detailansicht der Tools mit Kategorie & Verfügbarkeitsstatus */}
      {/* FMST-46: Mauerhofer Tool Bearbeiten*/}
      {tools.length === 0 ? (
        <p>Keine Tools vorhanden.</p>
      ) : (
        <div className="overflow-x-auto">
          <table
            className="tool-table"
            data-testid="tools-table"
            role="table"
            aria-label="Tools Tabelle"
          >
            <thead>
              <tr>
                <th>Name</th>
                <th>Kategorie</th>
                <th>Status</th>
                
                <th>Aktionen</th>
              </tr>
            </thead>
            <tbody>
              {tools.map((tool) => (
                <tr key={tool.id}>
                  <td>{tool.name}</td>
                  <td>{tool.category}</td>
                  <td>{tool.available ? "Verfügbar" : "Nicht verfügbar"}</td>
              
                  <td className="actions-cell">
                    <button
                      onClick={() => openModal(tool)}
                      className="edit-button"
                      aria-label={`Bearbeite ${tool.name}`}
                    >
                      Bearbeiten
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* FMST-74: Tool Detail Modal */}
      {/* FMST-46: Mauerhofer Tool Bearbeiten*/}
      {showModal && selectedTool && (
        <div className="modal-overlay">
          <div className="modal-window modal-edit">
            <button
              onClick={closeModal}
              className="modal-close-button"
              aria-label="Schließen"
            >
              ✕
            </button>

            <h2 className="modal-title">Tool bearbeiten</h2>

            {error && (
              <div className="error-message" style={{ marginBottom: "1rem" }}>
                {error}
              </div>
            )}

            <label className="form-label">
              <span>Tool-Name</span>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="modal-input"
              />
            </label>

            <label className="form-label">
              <span>Kategorie</span>
              <select
                value={editCategory}
                onChange={(e) => setEditCategory(e.target.value)}
                className="modal-select"
              >
                <option value="Maschine">Maschine</option>
                <option value="Handwerkzeug">Handwerkzeug</option>
              </select>
            </label>

            <label className="form-label checkbox-label">
              <input
                type="checkbox"
                checked={editAvailable}
                onChange={(e) => setEditAvailable(e.target.checked)}
                className="modal-checkbox"
              />
              <span>Verfügbar</span>
            </label>

            <div className="tool-id-info">
              ID: {selectedTool.id}
            </div>

            <div className="modal-buttons">
              <button
                onClick={handleSaveEdit}
                className="modal-save"
              >
                Speichern
              </button>
              <button
                onClick={closeModal}
                className="modal-cancel"
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
