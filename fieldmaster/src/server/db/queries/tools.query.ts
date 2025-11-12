'server-only'

import { db } from "@/src/server/db/index";
import { Farm } from "@/src/server/db/schema/schema";
import { toolsTable } from "@/src/server/db/schema/schema";
import { eq } from "drizzle-orm";
import { UUID } from "crypto";

type Tool = {
    name: string
    category: string 
    available: boolean
    }

export const TOOL_QUERIES = {
    // Load Tools from DB 
    async getToolsFromDB() {
        const tools = await db.select().from(toolsTable)
        return tools
        },

    // Create new Tool in DB
    async createToolInDB(tool: Tool) {
        await db.insert(toolsTable).values({
            name: tool.name,
            category: tool.category,
            available: tool.available,
        })
    }

}