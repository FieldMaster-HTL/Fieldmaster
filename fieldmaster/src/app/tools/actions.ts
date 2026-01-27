'use server'

import { QUERIES } from "@/src/server/db/queries/queries";


    /**
     * Retrieve all tools from the database.
     *
     * @returns An array of tool records retrieved from the database.
     * @throws Error when tools cannot be loaded from the database
     */
    export async function loadTools() {
    try {
    return await QUERIES.TOOL.getToolsFromDB()
    } catch (error) {
      console.error('Failed to load tools:', error)
      throw new Error('Unable to load tools')
    }
    }

/**
 * Create a new tool record from the provided form data and availability flag.
 *
 * @param form - Object with `name` and `category` fields; both are required and are trimmed before use
 * @param available - Whether the tool is available
 * @returns The created tool record as returned by the database
 * @throws Error('Tool name is required') if `form.name` is missing or empty after trimming
 * @throws Error('Tool category is required') if `form.category` is missing or empty after trimming
 * @throws Error('Unable to create tool') if the database insertion fails
 */
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

/**
 * Updates an existing tool's name, category, and availability in the database.
 *
 * @param id - The identifier of the tool to update
 * @param name - The new name for the tool (must be non-empty)
 * @param category - The new category for the tool (must be non-empty)
 * @param available - Whether the tool should be marked as available
 * @returns An object containing `tool` with the updated tool on success and `error` set to `null`; on validation failure or failure to update, `tool` is `null` and `error` contains a descriptive message
 */
export async function updateTool(
  id: string,
  name: string,
  category: string,
  available: boolean
) {
  // Validate inputs
  if (!name?.trim()) {
    return { tool: null, error: "Tool name is required" };
  }
  if (!category?.trim()) {
    return { tool: null, error: "Tool category is required" };
  }

  try {
    const updatedTool = await QUERIES.TOOL.updateToolInDB(id, {
      name: name.trim(),
      category: category.trim(),
      available,
    });
    return { tool: updatedTool, error: null };
  } catch (error) {
    console.error("Failed to update tool:", error);
    return { tool: null, error: "Unable to update tool" };
  }
}