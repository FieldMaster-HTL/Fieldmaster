"server-only";

import { db } from "@/src/server/db/index";
import { toolsTable } from "@/src/server/db/schema/schema";

// Definiert den Typ eines Tools (wird beim Erstellen eines neuen Tools verwendet)
type Tool = {
  name: string;
  category: string;
  available: boolean;
};

// ---------- Datenbankabfragen ----------

// Objekt mit allen Datenbankfunktionen rund um Tools
export const TOOL_QUERIES = {
  // Lädt alle Tools aus der Datenbank
  async getToolsFromDB() {
    // SELECT * FROM toolsTable
    const tools = await db.select().from(toolsTable);
    return tools; // Gibt das Array der Tools zurück
  },

  // Erstellt ein neues Tool in der Datenbank
  async createToolInDB(tool: Tool) {
    // INSERT INTO toolsTable (name, category, available) VALUES (...)
    await db.insert(toolsTable).values({
      name: tool.name,
      category: tool.category,
      available: tool.available,
    });
  },
};
