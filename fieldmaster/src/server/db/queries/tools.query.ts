'server-only' 

import { db } from "@/src/server/db/index"; 
import { Farm } from "@/src/server/db/schema/schema";
import { toolsTable } from "@/src/server/db/schema/schema";
import { eq } from "drizzle-orm";

// Definiert den Typ eines Tools (wird beim Erstellen eines neuen Tools verwendet)
type Tool = {
    name: string
    category: string 
    available: boolean
}


// ---------- Datenbankabfragen ----------

// Objekt mit allen Datenbankfunktionen rund um Tools
export const TOOL_QUERIES = {

    // Lädt alle Tools aus der Datenbank
    async getToolsFromDB() {
        // SELECT * FROM toolsTable
            try {
                const tools = await db.select().from(toolsTable)
                return tools // Gibt das Array der Tools zurück
            } catch (err) {
                console.error('Error in TOOL_QUERIES.getToolsFromDB:', err)
                throw err
            }
    },

  // Erstellt ein neues Tool in der Datenbank
  async createToolInDB(tool: Tool) {
    // INSERT INTO toolsTable (name, category, available) VALUES (...)
    const result = await db.insert(toolsTable).values({
      name: tool.name,
      category: tool.category,
      available: tool.available,
    }).returning();
    return result[0];
  },

  // Aktualisiert ein Tool in der Datenbank
  async updateToolInDB(id: string, tool: Partial<Tool>) {
    // UPDATE toolsTable SET ... WHERE id = ...
    const result = await db
      .update(toolsTable)
      .set(tool)
      .where(eq(toolsTable.id, id))
      .returning();
    return result[0];
  },
};
