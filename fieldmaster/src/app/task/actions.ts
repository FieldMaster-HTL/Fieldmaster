//FMST-35

'use server'

import { AREA_QUERIES } from '@/src/server/db/queries/area.query'
import { TASK_QUERIES, TASK_MUTATIONS } from '@/src/server/db/queries/task.query'
import {TASKTOOL_QUERIES, TASKTOOL_MUTATIONS} from '@/src/server/db/queries/taskTool.query'
import { TOOL_QUERIES } from '@/src/server/db/queries/tools.query'
import type { UUID } from 'crypto'
import type { Task } from '@/src/server/db/type/DBTypes'

// Fetch all tasks
// Server action wrappers used by client components.
// These functions call DB query helpers and return plain JSON-serializable
// objects (we stringify/parse results) so they can be safely passed from
// server actions to client components without prototype/Date issues.

export async function getAllTasksAction() {
  try {
    const tasks = await TASK_QUERIES.getAll()
    return JSON.parse(JSON.stringify(tasks))
  } catch (err) {
    console.error('Error loading tasks:', err)
    throw err
  }
}
// Fetch all areas
export async function getAllAreasAction() {
  try {
    const areas = await AREA_QUERIES.getAllAreas()
    return JSON.parse(JSON.stringify(areas))
  } catch (err) {
    console.error('Error loading areas:', err)
    throw err
  }
}
// Fetch all tools - FMST-12 | Pachler
export async function getAllToolsAction() {
  try {
    const tools = await TOOL_QUERIES.getToolsFromDB()
    return JSON.parse(JSON.stringify(tools))
  } catch (err) {
    console.error('Error loading tools:', err)
    throw err
  }
}
// Fetch all task tools - FMST-12 | Pachler
export async function getAllTaskToolsAction() {
  try {
    const taskTools = await TASKTOOL_QUERIES.getAllTaskTools()
    return JSON.parse(JSON.stringify(taskTools))
  } catch (err) {
    console.error('Error loading task tools:', err)
    throw err
  }
}

// Fetch tools for a specific task - FMST-12 | Pachler
export async function getToolsForTaskAction(taskId: UUID) {
  try {
    const tools = await TASKTOOL_QUERIES.getToolsForTask(taskId)
    return JSON.parse(JSON.stringify(tools))
  } catch (err) {
    console.error('Error loading tools for task:', err)
    throw err
  }
}


// Create a new task

export async function createTaskAction(
  name: string,
  description?: string,
  creatorClerkId?: string,
  due_to?: Date,
  // Area ID to link task to specific area | FMST-11
  areaId?: string 
) {
  try {
    const newTask = await TASK_MUTATIONS.createTask(
      name,
      description ?? '',
      creatorClerkId,
      due_to,
      areaId ?? undefined
    )
    // Return created task as plain JSON so client can use the new id
    return JSON.parse(JSON.stringify(newTask))
  } catch (err) {
    console.error('Error creating task:', err)
    throw err
  }
}

// Set tools for a specific task - FMST-12 | Pachler
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


// Update a task

export async function updateTaskAction(
  id: UUID,
  values: Partial<{ name: string; description: string; dueTo: Date; areaId: string }>
) {
  try {
    // Update the task row. Values are filtered server-side so undefined
    // fields are not set. Return a plain result for the client.
    const res = await TASK_MUTATIONS.updateTask(id, values)
    return JSON.parse(JSON.stringify(res))
  } catch (err) {
    console.error('Error updating task:', err)
    throw err
  }
}

// Delete a task
export async function deleteTaskAction(id: UUID) {
  try {
    const res = await TASK_MUTATIONS.deleteTask(id)
    return JSON.parse(JSON.stringify(res))
  } catch (err) {
    console.error('Error deleting task:', err)
    throw err
  }
}

// *******************************************
// FMST-75: Sort and filter tasks (extended)
// *******************************************
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
        tasks = tasks.filter(task => task.description !== "[DELETED]");
        break;

      case "deleted":
        tasks = tasks.filter(task => task.description === "[DELETED]");
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
