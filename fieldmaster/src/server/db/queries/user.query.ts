"server-only";

import { db } from "@/src/server/db";
import { User } from "@/src/server/db/schema/schema";
import { UUID } from "crypto";
import { eq } from "drizzle-orm";

// UserStory: FMST-32
export const USER_QUERIES = {
  async mapClerkIdtoLocalId(clerkId: string) {
    return db
      .select({ id: User.id })
      .from(User)
      .where(eq(User.clerkId, clerkId))
      .limit(1)
      .then((row) => {
        const id = row[0]?.id;
        if (!id) throw new Error("no user found for clerkId:" + { clerkId });
        return id as UUID;
      });
  },
};

// UserStory: FMST-32
export const USER_MUTATIONS = {
  async createUser(
    clerkId: string,
    firstName: string | null,
    lastName: string | null,
  ) {
    return db.insert(User).values({ clerkId, firstName, lastName });
  },
  async deleteUser(id: UUID) {
    const date: Date = new Date();
    return db.update(User).set({ deletedAt: date }).where(eq(User.id, id));
  },
  async deleteByClerkId(clerkId: string) {
    return USER_QUERIES.mapClerkIdtoLocalId(clerkId).then((id) => {
      return USER_MUTATIONS.deleteUser(id);
    });
  },
  async updateUser(
    id: UUID,
    values: {
      firstName?: string | null;
      lastName?: string | null;
    },
  ) {
    return db.update(User).set(values).where(eq(User.id, id)).returning();
  },
  async updateByClerkId(
    clerkId: string,
    values: {
      firstName?: string | null;
      lastName?: string | null;
    },
  ) {
    return USER_QUERIES.mapClerkIdtoLocalId(clerkId).then((id) => {
      return USER_MUTATIONS.updateUser(id, values);
    });
  },
};
