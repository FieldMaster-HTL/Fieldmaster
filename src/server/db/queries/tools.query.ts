'server-only' 

import { db } from "@/src/server/db/index"; 
import { Farm } from "@/src/server/db/schema/schema";
import { toolsTable } from "@/src/server/db/schema/schema";
import { categoriesTable } from "@/src/server/db/schema/schema";
import { eq } from "drizzle-orm";
import { UUID } from "crypto";


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
        const tools = await db.select().from(toolsTable)
        return tools // Gibt das Array der Tools zurück
    },

    // Lädt alle Kategorien aus der Datenbank - FMST-19 (Polt Leonie)
    async getCategoriesFromDB() {
        const categories = await db.select().from(categoriesTable)
        return categories
    },

    // Erstellt ein neues Tool in der Datenbank
    async createToolInDB(tool: Tool) {
        // INSERT INTO toolsTable (name, category, available) VALUES (...)
        await db.insert(toolsTable).values({
            name: tool.name,
            category: tool.category,
            available: tool.available,
        })
    },

    // Neue Kategorie erstellen - FMST-19 (Polt Leonie)
    async createCategoryInDB(name: string) {
        await db.insert(categoriesTable).values({
            name: name.trim(),
        })
    }
}