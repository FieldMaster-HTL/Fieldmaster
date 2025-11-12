'use server'

import { TASK_QUERIES, TASK_MUTATIONS } from '@/src/server/db/queries/task.query'
import type { UUID } from 'crypto'

/**
 * Alle Tasks abrufen
 */
export async function getAllTasksAction() {
  try {
    const tasks = await TASK_QUERIES.getAll()
    return tasks
  } catch (err) {
    console.error('Fehler beim Laden der Tasks:', err)
    return []
  }
}

/**
 * Neue Task erstellen
 */
export async function createTaskAction(
  name: string,
  description?: string,
  creatorClerkId?: string,
  farmClerkId?: string,
  due_to?: Date
) {
  try {
    const newTask = await TASK_MUTATIONS.createTask(
      name,
      description ?? '',
      creatorClerkId,
      due_to
    )
    return newTask
  } catch (err) {
    console.error('Fehler beim Erstellen der Task:', err)
    throw err
  }
}
/**
 * Task aktualisieren
 */
export async function updateTaskAction(
  id: UUID,
  values: Partial<{ name: string; description: string; due_to: Date }>
)
 {
  try {
    return await TASK_MUTATIONS.updateTask(id, values)
  } catch (err) {
    console.error('Fehler beim Aktualisieren der Task:', err)
    throw err
  }
}

/**
 * Task löschen
 */
export async function deleteTaskAction(id: UUID) {
  try {
    return await TASK_MUTATIONS.deleteTask(id)
  } catch (err) {
    console.error('Fehler beim Löschen der Task:', err)
    throw err
  }
}

