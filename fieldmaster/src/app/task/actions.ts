//FMST-35

"use server";

import { TASK_QUERIES, TASK_MUTATIONS } from "@/src/server/db/queries/task.query";
import { Task } from "@/src/server/db/type/DBTypes";
import { isUUID } from "@/src/util/uuidValidator";
import type { UUID } from "crypto";

// Fetch all tasks
export async function getAllTasksAction(): Promise<{
  tasks: Task[] | null;
  error?: string;
}> {
  try {
    const tasks = await TASK_QUERIES.getAll();

    return {
      tasks,
    };
  } catch (err) {
    if (err instanceof Error) {
      return {
        tasks: null,
        error: err.message,
      };
    } else {
      return {
        tasks: null,
        error: "unknown error",
      };
    }
  }
}

// Create a new task
export async function createTaskAction(
  name: string,
  description?: string,
  creatorClerkId?: string,
  due_to?: Date,
): Promise<{
  task: Task | null;
  error?: string;
}> {
  try {
    const newTask = await TASK_MUTATIONS.createTask(
      name,
      description ?? "",
      creatorClerkId,
      due_to,
    );
    if (!newTask) throw Error("unknown error db/ orm");
    return {
      task: newTask,
    };
  } catch (err) {
    if (err instanceof Error) {
      return {
        task: null,
        error: err.message,
      };
    } else {
      return {
        task: null,
        error: "unknown error",
      };
    }
  }
}

// Update a task
export async function updateTaskAction(
  id: string,
  values: Partial<{ name: string; description: string; dueTo: Date }>,
): Promise<{
  task: Task | null;
  error?: string;
}> {
  if (!isUUID(id)) {
    return {
      task: null,
      error: `id is not a valid UUID: ${id}`,
    };
  }
  const taskId = id as UUID;
  try {
    await TASK_MUTATIONS.updateTask(taskId, values);

    const updated = await TASK_QUERIES.mapIdToTask(taskId);
    return {
      task: updated,
    };
  } catch (err: unknown) {
    if (err instanceof Error) {
      return {
        task: null,
        error: err.message,
      };
    } else {
      return {
        task: null,
        error: "unknown error",
      };
    }
  }
}

// *******************************************
/******************FMST-50*******************/
// *******************************************
// Delete a task
export async function deleteTaskAction(id: string): Promise<{
  task: Task | null;
  error?: string;
}> {
  if (!isUUID(id)) {
    return {
      task: null,
      error: `id is not a valide UUID: ${id}`,
    };
  }
  const taskId = id as UUID;

  try {
    await TASK_MUTATIONS.deleteTask(taskId);

    const deleted = await TASK_QUERIES.mapIdToTask(taskId);
    return {
      task: deleted,
    };
  } catch (err) {
    if (err instanceof Error) {
      return {
        task: null,
        error: err.message,
      };
    } else {
      return {
        task: null,
        error: "unknown error",
      };
    }
  }
}
