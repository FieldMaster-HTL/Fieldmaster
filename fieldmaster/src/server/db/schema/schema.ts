import { pgTable, text, timestamp, uuid, boolean, doublePrecision } from "drizzle-orm/pg-core";

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

//Area FMST-42 Lorenzer
export const Area = pgTable("area", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  size: doublePrecision("size").notNull(),
  // new category field: only store predefined values as text (validate in server)
  category: text("category").notNull().default("WIESE"),
  creatorId: uuid("creatorId").references(() => User.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  deletedAt: timestamp("deletedAt"),
});

// Tools Table - FMST-76 (Polt Leonie) - überarbeitung von db
export const toolsTable = pgTable("tools", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  description: text("description"),   
  imageUrl: text("image_url"),         
  available: boolean("available").notNull(),
  area: text("area"),      
  deleted: boolean('deleted').default(false).notNull(), // FMST-76 (Polt Leonie) - Spalte für soft delete
                
});


//FMST-35
export const Task = pgTable("task", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  creatorId: uuid("creatorId").references(() => User.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  dueTo: timestamp("dueTo"),
  areaId: uuid("areaId").references(() => Area.id),
  priority: text("priority"),
});

// FMST-19 (Polt Leonie) - tabelle mit benötigten Spalten für Kategorien
export const categoriesTable = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  deletedAt: timestamp("deletedAt"),
});
