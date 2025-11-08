"server-only";

import { db } from "@/src/server/db/index";
import { Farm } from "@/src/server/db/schema/schema";
import { USER_QUERIES } from "./user.query";
import { eq } from "drizzle-orm";
import { UUID } from "crypto";

export const FARM_QUERIES = {
  async mapClerkIdToLocalId(clerkId: string) {
    return db
      .select({ id: Farm.id })
      .from(Farm)
      .where(eq(Farm.clerkId, clerkId))
      .limit(1)
      .then((rows) => {
        const id = rows[0]?.id;
        if (id) throw new Error("no Farm found for clerkId:" + { clerkId });
        return id as UUID;
      });
  },
};

export const FARM_MUTATIONS = {
  async createFarm(
    clerkId: string,
    name: string,
    slug: string,
    created_by?: string,
  ) {
    return (
      created_by
        ? USER_QUERIES.mapClerkIdtoLocalId(created_by)
        : Promise.resolve(null)
    ).then((id) =>
      db.insert(Farm).values({ clerkId, name, slug, creatorId: id }),
    );
  },
  async updateFarm(id: UUID, values: { name: string; slug: string }) {
    return db.update(Farm).set(values).where(eq(Farm.id, id));
  },
  async updateFarmByClerkId(
    clerkId: string,
    values: { name: string; slug: string },
  ) {
    return FARM_QUERIES.mapClerkIdToLocalId(clerkId).then((id) => {
      return FARM_MUTATIONS.updateFarm(id, values);
    });
  },
  async deleteFarm(id: UUID) {
    return db
      .update(Farm)
      .set({ deletedAt: new Date() })
      .where(eq(Farm.id, id));
  },
  async deleteFarmByClerkId(clerkId: string) {
    return FARM_QUERIES.mapClerkIdToLocalId(clerkId).then((id) =>
      FARM_MUTATIONS.deleteFarm(id),
    );
  },
};
