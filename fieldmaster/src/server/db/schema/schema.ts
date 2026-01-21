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

//Area FMST-30  / FMST-31
export const Area = pgTable("area", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  size: doublePrecision("size").notNull(),
  creatorId: uuid("creatorId").references(() => User.id),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  deletedAt: timestamp("deletedAt"),
});

// Tools Table - FMST-12 | Pachler
export const toolsTable = pgTable("tools", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  available: boolean("available").notNull(),
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
  completed: boolean("completed").default(false).notNull(),
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
