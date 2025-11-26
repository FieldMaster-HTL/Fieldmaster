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
    return db.select().from(Task)
  },
}

export const TASK_MUTATIONS = {
  // Create a new task
  async createTask(
    name: string,
    description: string,
    creatorClerkId?: string,
    dueTo?: Date,
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
      ...(areaId && { areaId: areaId }), // add areaId if provided
    }).returning()
    return task
  },

  // Update an existing task
  async updateTask(id: UUID, values: Partial<{ name: string; description: string; dueTo: Date; areaId: string }>) {
    return db.update(Task).set(values).where(eq(Task.id, id))
  },

  // "Soft delete" a task by marking description and clearing due date
  async deleteTask(id: UUID) {
    return db
      .update(Task)
      .set({ description: "[DELETED]", dueTo: null })
      .where(eq(Task.id, id))
  },
}
