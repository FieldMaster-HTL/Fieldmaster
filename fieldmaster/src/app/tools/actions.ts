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

export async function storeTools(form: { name: string; category: string }, available: boolean) {
    // Validate inputs
    if (!form.name?.trim()) {
        throw new Error('Tool name is required')
    }
    if (!form.category?.trim()) {
        throw new Error('Tool category is required')
    }

    const tool = { ...form, available }

    try {
        return await QUERIES.TOOL.createToolInDB(tool)
    } catch (error) {
        console.error('Failed to create tool:', error)
        throw new Error('Unable to create tool')
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
