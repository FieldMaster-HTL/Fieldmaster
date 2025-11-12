'use server'

import { db } from "@/src/server/db/index";
import { Farm } from "@/src/server/db/schema/schema";
import { toolsTable } from "@/src/server/db/schema/schema";
import { eq } from "drizzle-orm";
import { UUID } from "crypto";

export const TOOL_QUERIES = {
    // Load Tools from DB 
    async getToolsFromDB() {
        const tools = await db.select().from(toolsTable)
        return tools
        },


    // Create new Tool in DB
    async createToolInDB(tool: {
    name: string
    category: string
    available: boolean
    }) {
    await db.insert(toolsTable).values(tool)
    }
}