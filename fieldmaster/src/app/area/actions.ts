"use server";

import { MUTATIONS, QUERIES } from "@/src/server/db/queries/queries";
import { Area } from "@/src/server/db/type/DBTypes";

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
  error?: string;
}> {
  try {
    const res = await MUTATIONS.AREA.DeleteArea(areaId as any);
    if (!res) {
      throw Error();
    }
    return { success: true };
  } catch (error) {
    console.error('Error deleting area:', error);
    return { success: false, error: "Fehler beim Löschen der Area." };
  }
}
