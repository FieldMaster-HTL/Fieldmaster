//FMST-35

'use server'

import { AREA_QUERIES } from '@/src/server/db/queries/area.query'
import { TASK_QUERIES, TASK_MUTATIONS } from '@/src/server/db/queries/task.query'
import { isUUID } from "@/src/util/uuidValidator";
import {TASKTOOL_QUERIES, TASKTOOL_MUTATIONS} from '@/src/server/db/queries/taskTool.query'
import { TOOL_QUERIES } from '@/src/server/db/queries/tools.query'
import type { UUID } from 'crypto'
import type { Task } from '@/src/server/db/type/DBTypes'

// Fetch all tasks
// Server action wrappers used by client components.
// These functions call DB query helpers and return plain JSON-serializable
// objects (we stringify/parse results) so they can be safely passed from
/**
 * Retrieve all tasks from the database and return them as plain JSON-serializable objects.
 *
 * @returns The list of tasks as plain JSON objects suitable for sending to the client
 * @throws Any error encountered while loading tasks from the database
 */

export async function getAllTasksAction() {
  try {
    const tasks = await TASK_QUERIES.getAll()
    return JSON.parse(JSON.stringify(tasks))
  } catch (err) {
    console.error('Error loading tasks:', err)
    throw err
  }
}
/**
 * Retrieve all area records from the database.
 *
 * @returns The array of area objects suitable for JSON serialization
 */
export async function getAllAreasAction() {
  try {
    const areas = await AREA_QUERIES.getAllAreas()
    return JSON.parse(JSON.stringify(areas))
  } catch (err) {
    console.error('Error loading areas:', err)
    throw err
  }
}
/**
 * Retrieve all tools from the database and return them as plain JSON objects.
 *
 * @returns An array of tool objects serialized to plain JSON.
 * @throws Propagates the original error if the database query fails.
 */
export async function getAllToolsAction() {
  try {
    const tools = await TOOL_QUERIES.getToolsFromDB()
    return JSON.parse(JSON.stringify(tools))
  } catch (err) {
    console.error('Error loading tools:', err)
    throw err
  }
}
/**
 * Retrieve all task-tool association records from the database.
 *
 * @returns All task-tool association records as a JSON-serializable array.
 */
export async function getAllTaskToolsAction() {
  try {
    const taskTools = await TASKTOOL_QUERIES.getAllTaskTools()
    return JSON.parse(JSON.stringify(taskTools))
  } catch (err) {
    console.error('Error loading task tools:', err)
    throw err
  }
}

/**
 * Retrieve the tools associated with the given task.
 *
 * @param taskId - The UUID of the task to fetch tools for
 * @returns An array of tools associated with the specified task
 */
export async function getToolsForTaskAction(taskId: UUID) {
  try {
    const tools = await TASKTOOL_QUERIES.getToolsForTask(taskId)
    return JSON.parse(JSON.stringify(tools))
  } catch (err) {
    console.error('Error loading tools for task:', err)
    throw err
  }
}


/**
 * Create a new task record with the provided properties.
 *
 * @param name - The task's title
 * @param description - Optional description; defaults to an empty string when omitted
 * @param creatorClerkId - Optional clerk identifier for the task creator
 * @param due_to - Optional due date for the task
 * @param priority - Optional priority label for the task
 * @param areaId - Optional area identifier to associate the task with a specific area
 * @returns An object containing `task`: the created Task on success or `null` on failure, and an optional `error` message
 */

export async function createTaskAction(
  name: string,
  description?: string,
  creatorClerkId?: string,
  due_to?: Date,
  priority?: string,
  areaId?: string,
): Promise<{
  task: Task | null;
  error?: string;
}> {
  try {
    const newTask = await TASK_MUTATIONS.createTask(
      name,
      description ?? '',
      creatorClerkId,
      due_to,
      priority,
      areaId,
    );
    if (!newTask) throw Error("unknown error db/ orm");
    return {
      task: newTask,
    };
  } catch (err) {
    console.error('Error creating task:', err)
    throw err
  }
}

/**
 * Replace the tool associations for a task.
 *
 * @param taskId - The UUID of the task whose tool associations will be replaced
 * @param toolIds - Array of tool IDs to associate with the task (replaces existing associations)
 * @returns The new set of task-tool association records for the task
 * @throws Re-throws any error encountered while updating the task's tool associations
 */
export async function setTaskToolsAction(taskId: UUID, toolIds: string[]) {
  try {
    // Replace associations for a task (delete existing, insert new)
    const res = await TASKTOOL_MUTATIONS.setToolsForTask(taskId, toolIds)
    return JSON.parse(JSON.stringify(res))
  } catch (err) {
    console.error('Error setting tools for task:', err)
    throw err
  }
}


/**
 * Update an existing task's properties.
 *
 * @param id - The UUID of the task to update
 * @param values - Partial set of task fields to update; may include `name`, `description`, `dueTo`, `areaId`, and `priority`
 * @returns An object containing the updated `task` on success, or `task: null` and `error` with a message on failure. If `id` is not a valid UUID, `task` is `null` and `error` explains the invalid id.
 */

export async function updateTaskAction(
   id: UUID,
  values: Partial<{ name: string; description: string; dueTo: Date; areaId: string, priority: string; }>
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
/**
 * Delete a task identified by its UUID and return the deleted task record or an error.
 *
 * @param id - The UUID of the task to delete
 * @returns An object with `task` set to the deleted Task when successful, or `task: null` and an `error` message if the id is invalid or deletion fails
 */
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

/**
 * Mark a task as completed by its UUID.
 *
 * @param id - The UUID of the task to mark completed
 * @returns The updated task record on success, or an object with an `error` message on failure
 */
export async function markTaskCompletedAction(id: UUID) {
  try {
    return await TASK_MUTATIONS.markTaskCompleted(id);
  } catch (err) {
    console.error("Failed to mark task completed:", err);
    return { error: "Could not complete task." };
  }
}


// *******************************************
// FMST-75: Sort and filter tasks (extended)
/**
 * Retrieves tasks optionally filtered by status and sorted by due date.
 *
 * Allows filtering tasks by all, active (not marked as deleted), or deleted (marked as deleted).
 * Supports sorting tasks by their due date, placing tasks without a due date last.
 *
 * @param params.filter - The status filter to apply to tasks.
 * @param params.sort - The sorting criterion to apply to tasks.
 * @returns An object containing the filtered and sorted task list, or an error message if retrieval fails.
 */
export async function getTasksSortedFilteredAction(params: {
  filter?: "all" | "active" | "deleted";
  sort?: "dueDate";
}): Promise<{
  tasks: Task[] | null;
  error?: string;
}> {
  try {
    let tasks = await TASK_QUERIES.getAll();
    if (!tasks) throw new Error("No tasks found");

    /* -------------------------
       FILTER
    --------------------------*/
    switch (params.filter) {
      case "active":
        tasks = tasks.filter((task) => task.description !== "[DELETED]");
        break;

      case "deleted":
        tasks = tasks.filter((task) => task.description === "[DELETED]");
        break;

      case "all":
      default:
        break;
    }

    /* -------------------------
       SORT
    --------------------------*/
    switch (params.sort) {
      case "dueDate":
        tasks.sort((a, b) => {
          if (!a.dueTo && !b.dueTo) return 0;
          if (!a.dueTo) return 1;
          if (!b.dueTo) return -1;
          return a.dueTo.getTime() - b.dueTo.getTime();
        });
        break;

      default:
        break;
    }

    return { tasks };
  } catch (err) {
    if (err instanceof Error) {
      return { tasks: null, error: err.message };
    } else {
      return { tasks: null, error: "unknown error" };
    }
  }
}

