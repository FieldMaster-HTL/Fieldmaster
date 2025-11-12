"use server"

import { MUTATIONS, QUERIES } from "@/src/server/db/queries/queries"
import { UUID } from "crypto";

export async function createArea(name: string, size: string) {
    const res = await MUTATIONS.AREA.CreateArea(name, size);
    return res;
}

export async function getAllAreas() {
    const res = await QUERIES.AREA.getAllAreas();
    console.log(res);
    return res.map(area => {
        return {
            id: area.id,
            name: area.name,
            size: Number(area.size),
        }
    });
}
export async function getAreaById(id: UUID) {
    return await QUERIES.AREA.getAreaById(id);
}
export async function getAreasByCreator(creatorId: UUID) {
    return await QUERIES.AREA.getAreasByCreator(creatorId);
}