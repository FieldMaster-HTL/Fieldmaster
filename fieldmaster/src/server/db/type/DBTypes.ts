import {
  User as DBUser,
  toolsTable as DBTool,
  Area as DBArea,
  Farm as DBFarm,
  Task as DBTask,
} from "../schema/schema";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";

export type User = InferSelectModel<typeof DBUser>;
export type NewUser = InferInsertModel<typeof DBUser>;

export type Farm = InferSelectModel<typeof DBFarm>;
export type NewFarm = InferInsertModel<typeof DBFarm>;

export type Area = InferSelectModel<typeof DBArea>;
export type NewArea = InferInsertModel<typeof DBArea>;

export type Task = InferSelectModel<typeof DBTask>;
export type NewTask = InferInsertModel<typeof DBTask>;

export type Tool = InferSelectModel<typeof DBTool>;
export type NewTool = InferInsertModel<typeof DBTool>;
