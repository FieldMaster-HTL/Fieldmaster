"use server";

import { AREA_MUTATIONS, AREA_QUERIES } from "@/src/server/db/queries/area.query";
import { Area } from "@/src/server/db/type/DBTypes";
import { UUID } from "crypto";

// Area FMST-30  / FMST-31

export async function createArea(
  name: string,
  size: number,
): Promise<{
  area: Area | null;
  error?: string;
}> {
  try {
    const res = await AREA_MUTATIONS.CreateArea(name, size);
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
    const res = await AREA_QUERIES.getAllAreas();
    return { areas: res };
  } catch {
    return { areas: null, error: "an error occurred" };
  }
}

// FMST-43
export async function updateArea(
  id: string,
  name: string,
  size: number,
): Promise<{
  area: Area | null;
  error?: string;
}> {
  try {
    // Validate UUID format before calling
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return { area: null, error: "Invalid Area ID." };
    }

    const res = await AREA_MUTATIONS.UpdateArea(id, name, size);
    if (!res) {
      return { area: null, error: "Area not found." };
    }
    return { area: res };
  } catch {
    return { area: null, error: "an error occurred" };
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

    const res = await AREA_MUTATIONS.DeleteArea(areaId as unknown as UUID);
    if (!res) {
      // not found or nothing deleted
      return { success: false, area: null, error: "Area not found." };
    }
    return { success: true, area: res };
  } catch {
    return { success: false, error: "Error deleting area." };
  }
}

