'use server'

import { QUERIES } from "@/src/server/db/queries/queries";

export async function loadTools() {
    try {
        return await QUERIES.TOOL.getToolsFromDB()
    } catch (error) {
        console.error('Failed to load tools:', error)
        throw new Error('Unable to load tools')
    }
}

export async function storeTools(
  tool: {
    name: string
    category: string
    description?: string
    imageUrl?: string
    available: boolean
    area?: string
  },
  toolId?: string
) {
  if (!tool.name?.trim()) throw new Error('Tool name is required')
  if (!tool.category?.trim()) throw new Error('Tool category is required')

  try {
    if (!toolId) {
      return await QUERIES.TOOL.createToolInDB(tool)
    }

    return await QUERIES.TOOL.updateToolInDB(toolId, tool)
  } catch (error) {
    console.error('Failed to store tool:', error)
    throw new Error('Unable to store tool')
  }
}



export async function loadCategories() { // FMST-19 (Polt Leonie) - Laden von Kategorien aus DB
    try {
        return await QUERIES.TOOL.getCategoriesFromDB()
    } catch (error) {
        console.error('Failed to load categories:', error)
        throw error
    }
}

// FMST-19 (Polt Leonie) - Funktion zum Speichern einer neuen Kategorie
export async function storeCategory(name: string) {
    if (!name?.trim()) { // wenn name null
        throw new Error('Category name is required')
    }
    try {
        const result = await QUERIES.TOOL.createCategoryInDB(name) //kategorie speichern in db
        console.log('Category created successfully:', result)
        return result
    } catch (error) {
        console.error('Failed to create category:', error) //exception handling
        if (error instanceof Error) {
            throw new Error(`Failed to create category: ${error.message}`)
        }
        throw error
    }
}

// FMST-76 (Polt Leonie) - Funktion zum soft löschen eines tools
export async function deleteTool(toolId: string) {
  try {
    await QUERIES.TOOL.softDeleteToolInDB(toolId)
    return { success: true }
  } catch (error) {
    console.error('Failed to delete tool:', error)
    throw new Error('Unable to delete tool')
  }
}

// FMST-76 (Polt Leonie) - Funktion zum Laden aller Areas
export async function loadAreas() {
    try {
        return await QUERIES.AREA.getAllAreas()
    } catch (error) {
        console.error('Failed to load areas:', error)
        throw new Error('Unable to load areas')
    }
}