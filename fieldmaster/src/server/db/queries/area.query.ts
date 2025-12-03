"server-only";

//Area FMST-30  / FMST-31

import { db } from "@/src/server/db/index";
import { Area } from "@/src/server/db/schema/schema";
import type { Area as AreaRow } from "@/src/server/db/type/DBTypes";
import { eq, and, isNull } from "drizzle-orm";
import { UUID } from "crypto";

export const AREA_QUERIES = {
  async getAllAreas() {
    return db.select().from(Area).where(isNull(Area.deletedAt));
  },

  async getAreasByCreator(creatorId: UUID) {
    return db
      .select()
      .from(Area)
      .where(and(eq(Area.creatorId, creatorId), isNull(Area.deletedAt)));
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

  async DeleteArea(areaId: UUID): Promise<AreaRow | undefined> {
    return db
      .update(Area)
      .set({ deletedAt: new Date() })
      .where(eq(Area.id, areaId))
      .returning()
      .then((rows: AreaRow[]) => {
        return rows[0];
      });
  }
};
