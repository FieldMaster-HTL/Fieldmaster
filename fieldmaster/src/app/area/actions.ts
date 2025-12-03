"use server";

import { MUTATIONS, QUERIES } from "@/src/server/db/queries/queries";
import { Area } from "@/src/server/db/type/DBTypes";

// Server actions for Areas (FMST-42).
// Minimal English inline comments.

export async function createArea(
  name: string,
  size: number,
  category?: string,
): Promise<{
  area: Area | null;
  error?: string;
}> {
  try {
    // Forward data to mutation layer (which validates category).
    const res = await MUTATIONS.AREA.CreateArea(name, size, undefined, category);
    if (!res) throw Error();
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
    // Return all areas from query layer.
    const res = await QUERIES.AREA.getAllAreas();
    return { areas: res };
  } catch {
    return { areas: null, error: "an error occurred" };
  }
}
