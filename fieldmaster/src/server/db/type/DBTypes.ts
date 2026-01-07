import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import {
  User as DBUser,
  Area as DBArea,
  Farm as DBFarm,
  Task as DBTask,
} from "../schema/schema";

export type User = InferSelectModel<typeof DBUser>;
export type NewUser = InferInsertModel<typeof DBUser>;

export type Farm = InferSelectModel<typeof DBFarm>;
export type NewFarm = InferInsertModel<typeof DBFarm>;

export type Area = InferSelectModel<typeof DBArea>;
export type NewArea = InferInsertModel<typeof DBArea>;

export type Task = InferSelectModel<typeof DBTask>;
export type NewTask = InferInsertModel<typeof DBTask>;
