'use server'

import { QUERIES } from "@/src/server/db/queries/queries";
'use server'

import { QUERIES } from "@/src/server/db/queries/queries";


    export async function loadTools() {
    return await QUERIES.TOOL.getToolsFromDB()
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
