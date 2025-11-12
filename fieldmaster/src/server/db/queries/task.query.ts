"server-only"

import { db } from "@/src/server/db/index"
import { Task } from "@/src/server/db/schema/schema"
import { USER_QUERIES } from "./user.query"
import { eq } from "drizzle-orm"
import { UUID } from "crypto"

export const TASK_QUERIES = {
  async mapIdToTask(id: UUID) {
    const rows = await db.select().from(Task).where(eq(Task.id, id)).limit(1)
    const task = rows[0]
    if (!task) throw new Error("no Task found for id: " + id)
    return task
  },


  async getTasksByCreator(userClerkId: string) {
    const userId = await USER_QUERIES.mapClerkIdtoLocalId(userClerkId)
    return db.select().from(Task).where(eq(Task.creatorId, userId))
  },

  async getAll() {
    return db.select().from(Task)
  },
}

export const TASK_MUTATIONS = {
  async createTask(
    name: string,
    description: string,
    creatorClerkId?: string,
    due_to?: Date
  ) {
    const creatorId = creatorClerkId
      ? await USER_QUERIES.mapClerkIdtoLocalId(creatorClerkId).catch((err) => {
        console.warn(`creator lookup failed for clerkId ${creatorClerkId}`, err)
        return null
      })
      : null


    return db.insert(Task).values({
      name,
      description,
      ...(creatorId !== null && { creatorId }),
      //...(areaId !== null && { areaId }),
      ...(due_to && { dueTo: due_to }),
    })
  },

  async updateTask(id: UUID, values: Partial<{ name: string; description: string; due_to: Date }>) {
    return db.update(Task).set(values).where(eq(Task.id, id))
  },

  async deleteTask(id: UUID) {
    return db
      .update(Task)
      .set({ description: "[DELETED]", dueTo: null })
      .where(eq(Task.id, id))
  },
}
