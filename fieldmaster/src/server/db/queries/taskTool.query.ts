//FMST-4
import "server-only"

import { db } from "@/src/server/db/index"
import { toolsTable, TaskTool} from "@/src/server/db/schema/schema"
import { eq } from "drizzle-orm"
import { UUID } from "crypto"

export const TASKTOOL_QUERIES = {
  
  
  async getAllTaskTools() {
    return db.select().from(TaskTool)
  },

  async getToolsForTask(taskId: UUID) {
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
  }

}

export const TASKTOOL_MUTATIONS = {
  async setToolsForTask(taskId: UUID, toolIds: string[]) {
    // First, delete existing tool associations for the task
    await db.delete(TaskTool).where(eq(TaskTool.taskId, taskId))
    // If no new tool IDs provided, we're done
    if (!toolIds || toolIds.length === 0) return []
    // Then, insert new tool associations
    const insertValues = toolIds.map((toolId) => ({
      taskId: taskId,
      toolId: toolId,
    }))
    return db.insert(TaskTool).values(insertValues).returning()
  }
}
