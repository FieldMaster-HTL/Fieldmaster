//FMST-35

'use server'

import { TASK_QUERIES, TASK_MUTATIONS } from '@/src/server/db/queries/task.query'
import type { UUID } from 'crypto'
import { Task } from "@/src/server/db/type/DBTypes"

// Fetch all tasks
export async function getAllTasksAction(): Promise<Task[]> {
  try {
    const tasks = await TASK_QUERIES.getAll()

    return tasks
  } catch (err) {
    console.error('Error loading tasks:', err)
    return []
  }
}

// Create a new task
export async function createTaskAction(
  name: string,
  description?: string,
  creatorClerkId?: string,
  due_to?: Date
) {
  try {
    const newTask = await TASK_MUTATIONS.createTask(
      name,
      description ?? '',
      creatorClerkId,
      due_to
    )
    if (!newTask) return null
    return newTask
  } catch (err) {
    console.error('Error creating task:', err)
    throw err
  }
}

// Update a task
export async function updateTaskAction(
  id: UUID,
  values: Partial<{ name: string; description: string; due_to: Date }>
): Promise<Task> {
  try {
    await TASK_MUTATIONS.updateTask(id, values)
    const updated = await TASK_QUERIES.mapIdToTask(id)
    return updated
  } catch (err) {
    console.error('Error updating task:', err)
    throw err
  }
}

// *******************************************
/******************FMST-50*******************/
// *******************************************
// Delete a task
export async function deleteTaskAction(id: UUID): Promise<Task> {
  try {
    await TASK_MUTATIONS.deleteTask(id)

    const deleted = await TASK_QUERIES.mapIdToTask(id)
    return deleted
  } catch (err) {
    console.error('Error deleting task:', err)
    throw err
  }
}
