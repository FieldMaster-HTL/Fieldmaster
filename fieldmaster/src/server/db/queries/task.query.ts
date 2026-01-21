//FMST-35

import "server-only"

import { db } from "@/src/server/db/index"
import { Task } from "@/src/server/db/schema/schema"
import { USER_QUERIES } from "./user.query"
import { eq } from "drizzle-orm"
import { UUID } from "crypto"

export const TASK_QUERIES = {
  // Get task by its UUID
  async mapIdToTask(id: UUID) {
    const rows = await db.select().from(Task).where(eq(Task.id, id)).limit(1)
    const task = rows[0]
    if (!task) throw new Error("no Task found for id: " + id)
    return task
  },

  // Get all tasks created by a specific user (by clerk ID)
  async getTasksByCreator(userClerkId: string) {
    const userId = await USER_QUERIES.mapClerkIdtoLocalId(userClerkId)
    return db.select().from(Task).where(eq(Task.creatorId, userId))
  },

  // Get all tasks
  async getAll() {
    try {
      return await db.select().from(Task)
    } catch (err) {
      console.error('Error in TASK_QUERIES.getAll:', err)
      throw err
    }
  },
}

export const TASK_MUTATIONS = {
  // Create a new task
  async createTask(
    name: string,
    description: string,
    creatorClerkId?: string,
    dueTo?: Date,
    // Area ID to link task to specific area | FMST-11
    areaId?: string
  ) {
    const creatorId = creatorClerkId
      ? await USER_QUERIES.mapClerkIdtoLocalId(creatorClerkId).catch((err) => {
        console.warn(`creator lookup failed for clerkId ${creatorClerkId}`, err)
        return null
      })
      : null

    const [task] = await db.insert(Task).values({
      name,
      description,
      ...(creatorId !== null && { creatorId }), // add creatorId if exists
      ...(dueTo && { dueTo: dueTo }), // add due date if provided
      ...(areaId && { areaId: areaId }), // add areaId if provided (links task to an Area)
    }).returning()
    return task
  },

  // Update an existing task
  async updateTask(id: UUID, values: Partial<{ name: string; description: string; dueTo: Date; areaId: string }>) {
    // Remove undefined fields in a type-safe way so Drizzle doesn't attempt to set columns to undefined
    const entries = Object.entries(values).filter(([, v]) => v !== undefined)
    const filtered = Object.fromEntries(entries) as Partial<{
      name: string
      description: string
      dueTo: Date | null
      areaId: string | null
    }>

    return db.update(Task).set(filtered).where(eq(Task.id, id))
  },

  // "Soft delete" a task by marking description and clearing due date
  async deleteTask(id: UUID) {
    return db
      .update(Task)
      .set({ description: "[DELETED]", dueTo: null })
      .where(eq(Task.id, id))
  },
  // Mark task as completed/uncompleted | FMST-54 Pachler
    async markTaskCompleted(id: UUID) {
    return db
      .update(Task)
      .set({ completed: true })
      .where(eq(Task.id, id));
  },
}
