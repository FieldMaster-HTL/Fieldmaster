import { pgTable, text, integer, timestamp, serial } from "drizzle-orm/pg-core";

export const User = pgTable("users", {
  id: serial("id").primaryKey(),
  clerkId: text("clerk_user_id").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const Farm = pgTable("farm", {
  clerkId: text("clerk_organiasation_id").notNull().unique(),
  name: text("name"),
  creatorId: integer("").references(() => User.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
