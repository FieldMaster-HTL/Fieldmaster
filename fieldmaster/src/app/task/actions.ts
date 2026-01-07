//FMST-35

'use server'

import { TASK_QUERIES, TASK_MUTATIONS } from '@/src/server/db/queries/task.query'
import type { UUID } from 'crypto'

// Fetch all tasks

export async function getAllTasksAction() {
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
//  farmClerkId?: string,
  due_to?: Date,
  priority?: string
) {
  try {
    const newTask = await TASK_MUTATIONS.createTask(
      name,
      description ?? '',
      creatorClerkId,
      due_to,
      priority
    )
  } catch (err) {
    console.error('Error creating task:', err)
    throw err
  }
}

// Update a task

export async function updateTaskAction(
  id: UUID,
  values: Partial<{ name: string; description: string; dueTo: Date; priority: string }>
) {
  try {
    return await TASK_MUTATIONS.updateTask(id, values)
  } catch (err) {
    console.error('Error updating task:', err)
    throw err
  }
}

// Delete a task
export async function deleteTaskAction(id: UUID) {
  try {
    return await TASK_MUTATIONS.deleteTask(id)
  } catch (err) {
    console.error('Error deleting task:', err)
    throw err
  }
}
