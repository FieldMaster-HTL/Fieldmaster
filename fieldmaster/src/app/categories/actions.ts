'use server'

import { QUERIES } from "@/src/server/db/queries/queries";

export async function loadCategories() {
  try {
    return await QUERIES.TOOL.getCategoriesFromDB()
  } catch (error) {
    console.error('Failed to load categories:', error)
    throw new Error('Unable to load categories')
  }
}

export async function storeCategory(name: string) {
  if (!name?.trim()) {
    throw new Error('Category name is required')
  }
  try {
    return await QUERIES.TOOL.createCategoryInDB(name)
  } catch (error) {
    console.error('Failed to create category:', error)
    throw new Error('Unable to create category')
  }
}
