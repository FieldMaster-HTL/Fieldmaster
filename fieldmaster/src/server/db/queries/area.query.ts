"server-only";

//Area FMST-30  / FMST-31

import { db } from "@/src/server/db/index";
import { Area } from "@/src/server/db/schema/schema";
import { eq } from "drizzle-orm";
import { UUID } from "crypto";

export const AREA_QUERIES = {
    async getAllAreas() {
        return db.select()
            .from(Area)
    },


    async getAreasByCreator(creatorId: UUID) {
        return db.select().from(Area).where(eq(Area.creatorId, creatorId))
    },
};

export const AREA_MUTATIONS = {
    async CreateArea(
        name: string,
        size: number,
        creatorId?: UUID,)
    {
       return db.insert(Area).values({ name, size, creatorId }).returning();
    },

    async DeleteArea(areaId: UUID) {
        return db.update(Area)
            .set({ deletedAt: new Date() })
            .where(eq(Area.id, areaId))
            .returning();
    }
};


