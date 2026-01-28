import {
  User as DBUser,
  Area as DBArea,
  Farm as DBFarm,
  Task as DBTask,
  toolsTable as DBTool,
} from "../schema/schema";
import { InferInsertModel, InferSelectModel } from "drizzle-orm";

export type User = InferSelectModel<typeof DBUser>;
export type NewUser = InferInsertModel<typeof DBUser>;

export type Farm = InferSelectModel<typeof DBFarm>;
export type NewFarm = InferInsertModel<typeof DBFarm>;

export type Task = InferSelectModel<typeof DBTask>;
export type NewTask = InferInsertModel<typeof DBTask>;

export type Area = InferSelectModel<typeof DBArea>;
export type NewArea = InferInsertModel<typeof DBArea>;

export type Tool = InferSelectModel<typeof DBTool>;
export type NewTool = InferInsertModel<typeof DBTool>;
