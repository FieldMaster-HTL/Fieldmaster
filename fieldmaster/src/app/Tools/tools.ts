'use server'

import { drizzle } from 'drizzle-orm/node-postgres'
import { eq } from 'drizzle-orm'
import { toolsTable } from '../../db/schema'
import 'dotenv/config'

const db = drizzle(process.env.DATABASE_URL!)

// Load Tools from DB 
export async function getToolsFromDB() {
  const tools = await db.select().from(toolsTable)
  return tools
}

// Create new Tool in DB
export async function createToolInDB(tool: {
  name: string
  category: string
  available: boolean
}) {
  await db.insert(toolsTable).values(tool)
}
