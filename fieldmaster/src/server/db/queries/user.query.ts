"server-only";

import { db } from "@/src/server/db";
import { User } from "@/src/server/db/schema/schema";

export const USER_QUERIES = {};

export const USER_MUTATIONS = {
  createUser(
    clerkId: string,
    firstName: string | null,
    lastName: string | null,
  ) {
    return db.insert(User).values({ clerkId, firstName, lastName });
  },
};
