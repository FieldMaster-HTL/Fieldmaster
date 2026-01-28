'server-only' 

import { db } from "@/src/server/db/index"; 
import { Farm } from "@/src/server/db/schema/schema";
import { toolsTable } from "@/src/server/db/schema/schema";
import { categoriesTable } from "@/src/server/db/schema/schema";
import { eq, and } from "drizzle-orm";
import { UUID } from "crypto";

// Definiert den Typ eines Tools (wird beim Erstellen eines neuen Tools verwendet)
type Tool = {
  name: string
  category: string
  description?: string
  imageUrl?: string
  available: boolean
  area?: string
}


// ---------- Datenbankabfragen ----------

// Objekt mit allen Datenbankfunktionen rund um Tools
export const TOOL_QUERIES = {

    // Lädt alle Tools aus der Datenbank
    async getToolsFromDB() {
        // SELECT * FROM toolsTable
        const tools = await db.select().from(toolsTable).where(eq(toolsTable.deleted, false)) // Nur nicht gelöschte Tools
        return tools // Gibt das Array der Tools zurück
    },

    // Lädt alle Kategorien aus der Datenbank - FMST-19 (Polt Leonie)
    async getCategoriesFromDB() {
        const categories = await db.select().from(categoriesTable)
        return categories
    },

    // soft löschen eines tools
    async softDeleteToolInDB(id: string) {
        await db
        .update(toolsTable)
        .set({ deleted: true })
        .where(eq(toolsTable.id, id))
    },

    // Erstellt ein neues Tool in der Datenbank
    async createToolInDB(tool: Tool) {
        await db.insert(toolsTable).values({
        name: tool.name,
        category: tool.category,
        description: tool.description,
        imageUrl: tool.imageUrl,
        available: tool.available,
        area: tool.area,
    })
    },


    async updateToolInDB(id: string, tool: any) {
        await db.update(toolsTable).set({
        name: tool.name,
        category: tool.category,
        description: tool.description,
        imageUrl: tool.imageUrl,
        available: tool.available,
        area: tool.area,
        })
        .where(eq(toolsTable.id, id))
        },


    // Neue Kategorie erstellen - FMST-19 (Polt Leonie)
    async createCategoryInDB(name: string) {
        await db.insert(categoriesTable).values({
            name: name.trim(),
        })
    }
}
