"use server";

import { AREA_MUTATIONS, AREA_QUERIES } from "@/src/server/db/queries/area.query";
import { MUTATIONS, QUERIES } from "@/src/server/db/queries/queries";
import { Area } from "@/src/server/db/type/DBTypes";

/**
 * Create a new Area record with the provided name, size, and optional category.
 *
 * @param name - Human-readable name for the area
 * @param size - Size of the area (units defined by the caller)
 * @param category - Optional category label for the area
 * @returns An object with `area` set to the created Area on success, or `null` and an `error` message on failure
 */

export async function createArea(
  name: string,
  size: number,
  category?: string,
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

/**
 * Retrieve all area records.
 *
 * @returns An object with `areas` containing the array of Area records on success; if an error occurs `areas` is `null` and `error` contains an error message.
 */
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