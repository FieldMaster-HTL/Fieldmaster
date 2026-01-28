import {
  pgTable,
  text,
  timestamp,
  uuid,
  boolean,
  doublePrecision,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

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

// Tools Table - FMST-76 (Polt Leonie) - überarbeitung von db & FMST-12 | Pachler
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
  completed: boolean("completed").default(false).notNull(),
  deletedAt: timestamp("deletedAt"),
});

// FMST-19 (Polt Leonie) - tabelle mit benötigten Spalten für Kategorien
export const categoriesTable = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  deletedAt: timestamp("deletedAt"),
});

//FMST-12 | Pachler
export const TaskTool = pgTable("task_tools", {
  id: uuid("id").defaultRandom().primaryKey(),
  taskId: uuid("taskId").notNull().references(() => Task.id, { onDelete: "cascade", onUpdate: "cascade" }),
  toolId: uuid("toolId").notNull().references(() => toolsTable.id, { onDelete: "cascade", onUpdate: "cascade" }),
}, (table) => ({
  // prevent duplicate assignments of the same tool to the same task
  unique_task_tool: uniqueIndex("task_tools_taskId_toolId_unique").on(table.taskId, table.toolId),
  // separate indexes to help lookup by taskId or toolId
  idx_task_tools_task_id: index("task_tools_task_id_idx").on(table.taskId),
  idx_task_tools_tool_id: index("task_tools_tool_id_idx").on(table.toolId),
}));

// Join table linking `task.id` <-> `tools.id` for a many-to-many
// relationship. Rows represent a single assignment of a tool to a task.
