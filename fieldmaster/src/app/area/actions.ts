"use server"

import { MUTATIONS, QUERIES } from "@/src/server/db/queries/queries"
import { UUID } from "crypto";

export async function createArea(name: string, size: DoubleRange) {
    await MUTATIONS.AREA.CreateArea(name, JSON.stringify(size));
}

export async function getAllAreas() {
    return QUERIES.AREA.getAllAreas();
}
export async function getAreaById(id: UUID) {
    return QUERIES.AREA.getAreaById(id);
}
export async function getAreasByCreator(creatorId: UUID) {
    return QUERIES.AREA.getAreasByCreator(creatorId);
}