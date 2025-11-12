"server-only";

import { db } from "@/src/server/db/index";
import { Area } from "@/src/server/db/schema/schema";
import { eq } from "drizzle-orm";
import { UUID } from "crypto";

export const AREA_QUERIES = {
    async getAllAreas() {
        return db.select()
            .from(Area)
    },

    async getAreaById(id: UUID) {

        return db
            .select()
            .from(Area)
            .where(eq(Area.id, id))
            .limit(1)
            .then(rows => {
                const row = rows[0]
                const Id = row?.id
                return Id as UUID;
            })
    },

    async getAreasByCreator(creatorId: UUID) {
        return db.select().from(Area).where(eq(Area.creatorId, creatorId))
    },
};

export const AREA_MUTATIONS = {
    async CreateArea(
        name: string,
        size: string,
        creatorId?: UUID,)
    {
        return db.insert(Area).values({ name, size , creatorId}).returning();
    }
};


