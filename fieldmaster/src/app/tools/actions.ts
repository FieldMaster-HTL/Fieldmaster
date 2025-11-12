'use server'

import { QUERIES } from "@/src/server/db/queries/queries";
import { toolsTable } from "@/src/server/db/schema/schema";


    export async function loadTools() {
    return await QUERIES.TOOL.getToolsFromDB()
    }

    export async function storeTools(form: { name: string; category: string }, available: boolean) {
    const tool = { ...form, available }

    return await QUERIES.TOOL.createToolInDB(tool)
}
