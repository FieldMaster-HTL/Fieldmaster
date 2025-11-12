"use server"
//Area FMST-30  / FMST-31


import { MUTATIONS, QUERIES } from "@/src/server/db/queries/queries"
import { UUID } from "crypto";

export async function createArea(name: string, size: number) {
    const res = await MUTATIONS.AREA.CreateArea(name, size);
    return res;
}

export async function getAllAreas() {
    const res = await QUERIES.AREA.getAllAreas();
    return res.map(area => {
        return {
            id: area.id,
            name: area.name,
            size: area.size,
        }
    });
}
export async function getAreasByCreator(creatorId: UUID) {
    return await QUERIES.AREA.getAreasByCreator(creatorId);
}