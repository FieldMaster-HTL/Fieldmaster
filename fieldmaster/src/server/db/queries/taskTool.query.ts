//FMST-12
import "server-only"

import { db } from "@/src/server/db/index"
import { toolsTable, TaskTool} from "@/src/server/db/schema/schema"
import { eq } from "drizzle-orm"
import { UUID } from "crypto"

export const TASKTOOL_QUERIES = {
  
  
  async getAllTaskTools() {
    try {
      return await db.select().from(TaskTool)
    } catch (err) {
      console.error('Error in TASKTOOL_QUERIES.getAllTaskTools:', err)
      throw err
    }
  },

  async getToolsForTask(taskId: UUID) {
    try {
      const rows = await db.select().from(toolsTable)
        .innerJoin(TaskTool, eq(toolsTable.id, TaskTool.toolId))
        .where(eq(TaskTool.taskId, taskId))
    // Drizzle returns joined rows as objects keyed by table. Normalize to plain tool objects.
      return rows.map((row: any) => {
        if (row.toolsTable && row.toolsTable.id) return row.toolsTable
        if (row.tools && row.tools.id) return row.tools
        for (const v of Object.values(row)) {
          if (v && typeof v === 'object' && 'id' in v) return v
        }
        return row
      })
    } catch (err) {
      console.error('Error in TASKTOOL_QUERIES.getToolsForTask:', err)
      throw err
    }
  }

}

export const TASKTOOL_MUTATIONS = {
  async setToolsForTask(taskId: UUID, toolIds: string[]) {
    try {
      return await db.transaction(async (tx) => {
        // delete existing associations in the transaction
        await tx.delete(TaskTool).where(eq(TaskTool.taskId, taskId))

        // If no new tool IDs provided, return empty array (transaction will commit the delete)
        if (!toolIds || toolIds.length === 0) return []

        // Prepare insert values and insert within the same transaction
        const insertValues = toolIds.map((toolId) => ({
          taskId: taskId,
          toolId: toolId,
        }))

        const res = await tx.insert(TaskTool).values(insertValues).returning()
        return res
      })
    } catch (err) {
      console.error('Error in TASKTOOL_MUTATIONS.setToolsForTask:', err)
      throw err
    }
  }
}
