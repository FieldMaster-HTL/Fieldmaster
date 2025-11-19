"use server";

import { AREA_MUTATIONS, AREA_QUERIES } from "@/src/server/db/queries/area.query";
import { Area } from "@/src/server/db/type/DBTypes";

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
    const res = await AREA_MUTATIONS.UpdateArea(id, name, size);
    if (!res) {
      throw Error();
    }
    return { area: res };
  } catch {
    return { area: null, error: "an error occurred" };
  }
}

