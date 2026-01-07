"server-only";

//Area FMST-30  / FMST-31

import { db } from "@/src/server/db/index";
import { Area } from "@/src/server/db/schema/schema";
import { eq, isNull, and } from "drizzle-orm";
import { UUID } from "crypto";

export const AREA_QUERIES = {
  async getAllAreas() {
    try {
      return await db.select().from(Area).where(isNull(Area.deletedAt));
    } catch (err) {
      console.error('Error in AREA_QUERIES.getAllAreas:', err)
      throw err
    }
  },

  async getAreasByCreator(creatorId: UUID) {
    try {
      return await db.select().from(Area).where(and(eq(Area.creatorId, creatorId), isNull(Area.deletedAt)));
    } catch (err) {
      console.error('Error in AREA_QUERIES.getAreasByCreator:', err)
      throw err
    }
  },

  async getAreaById(id: UUID) {
    return db
      .select()
      .from(Area)
      .where(and(eq(Area.id, id), isNull(Area.deletedAt)))
      .limit(1)
      .then((rows) => {
        const area = rows[0];
        if (!area) throw new Error("no Area found for id: " + id);
        return area;
      });
  },
};

export const AREA_MUTATIONS = {
  async CreateArea(name: string, size: number, creatorId?: UUID) {
    return db
      .insert(Area)
      .values({ name, size, creatorId })
      .returning()
      .then((area) => {
        return area[0];
      });
  },
};
