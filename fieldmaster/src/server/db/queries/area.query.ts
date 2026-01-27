"server-only";

// Area queries & mutations (FMST-42 Lorenzer)
// Provides DB access helpers for Area entities using the project's Drizzle DB layer.

import { db } from "@/src/server/db/index";
import { Area } from "@/src/server/db/schema/schema";
import { eq, isNull, and } from "drizzle-orm";
import { UUID } from "crypto";

// Allowed category values for Areas. Server-side source of truth to prevent free-text categories.
export const ALLOWED_AREA_CATEGORIES = [
  "WIESE",
  "ACKER",
  "OBSTGARTEN",
  "WEINBERG",
  "WALD",
  "WEIDE",
  "SONSTIGES",
];

export const AREA_QUERIES = {
  // Fetch all areas (no filtering).
  async getAllAreas() {
    try {
      return await db.select().from(Area).where(isNull(Area.deletedAt));
    } catch (err) {
      console.error('Error in AREA_QUERIES.getAllAreas:', err)
      throw err
    }
  },

  // Fetch areas created by a specific user.
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
  /**
   * CreateArea
   * - Inserts a new Area record.
   * - Validates the provided category against ALLOWED_AREA_CATEGORIES.
   * - If category is invalid or absent, it will be omitted so DB default applies.
   *
   * Parameters:
   * - name: string (required)
   * - size: number (required)
   * - creatorId: UUID (optional)
   * - category: string (optional, must be one of ALLOWED_AREA_CATEGORIES)
   *
   * Returns:
   * - The created Area record (first returned row).
   */
  async CreateArea(
    name: string,
    size: number,
    creatorId?: UUID,
    category?: string
  ) {
    const cat =
      category && ALLOWED_AREA_CATEGORIES.includes(category)
        ? category
        : undefined;

    return db
      .insert(Area)
      .values({ name, size, creatorId, ...(cat ? { category: cat } : {}) })
      .returning()
      .then((area) => {
        return area[0];
      });
  },
};
