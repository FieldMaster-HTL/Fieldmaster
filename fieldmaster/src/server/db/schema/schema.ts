import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const User = pgTable("user", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkId: text("clerkUserId").notNull().unique(),
  firstName: text("firstName"),
  lastName: text("lastName"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  deletedAt: timestamp("deletedAt"),
});

export const Farm = pgTable("farm", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkId: text("clerkOrganisationId").notNull().unique(),
  name: text("name"),
  slug: text("slug"),
  creatorId: uuid("creatorId").references(() => User.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  deletedAt: timestamp("deletedAt"),
});

export const Task = pgTable("task", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  creatorId: uuid("creator_id").references(() => User.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  dueTo: timestamp("due_to"),
  areaId: uuid("area_id").references(() => Farm.id),
})