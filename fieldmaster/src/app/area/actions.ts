"use server";

import { MUTATIONS, QUERIES } from "@/src/server/db/queries/queries";
import { Area } from "@/src/server/db/type/DBTypes";
import { UUID } from "crypto";

//Area FMST-30  / FMST-31

export async function createArea(
  name: string,
  size: number,
): Promise<{
  area: Area | null;
  error?: string;
}> {
  try {
    const res = await MUTATIONS.AREA.CreateArea(name, size);
    if (!res) {
      throw Error();
    }
    return { area: res };
  } catch {
    return { area: null, error: "an error occurred" };
  }
}

export async function getAllAreas(): Promise<{
  areas: Area[] | null;
  error?: string;
}> {
  try {
    const res = await QUERIES.AREA.getAllAreas();
    return { areas: res };
  } catch {
    return { areas: null, error: "an error occurred" };
  }
}

export async function deleteArea(areaId: string): Promise<{
  success: boolean;
  area?: Area | null;
  error?: string;
}> {
  try {
    // Validate UUID format before calling
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(areaId)) {
      return { success: false, area: null, error: "Invalid Area ID." };
    }
    const res = await MUTATIONS.AREA.DeleteArea(areaId as UUID);
    if (!res) {
      // not found or nothing deleted
      return { success: false, area: null, error: "Area not found." };
    }
    return { success: true, area: res };
  } catch (error) {
    return { success: false, error: "Error deleting area." };
  }
}
