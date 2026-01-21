// FMST-7: Tasks anzeigen
// FMST-15: Areas anzeigen
// FMST-36: Dashboard anzeigen

// This test file verifies the main Dashboard page behavior.
// It mocks the area and task action modules and asserts UI updates
// for successful loads, view switching, date formatting and error handling.

import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

jest.mock('@/src/app/area/actions', () => ({
  getAllAreas: jest.fn()
}))

jest.mock('@/src/app/task/actions', () => ({
  getAllTasksAction: jest.fn()
}))

const { getAllAreas } = require('@/src/app/area/actions')
const { getAllTasksAction } = require('@/src/app/task/actions')

const Page = require('../src/app/dashboard/page').default

beforeEach(() => {
  jest.resetAllMocks()
})

// Test: After loading, Areas are displayed and the Areas button shows the correct count.
// - Setup: mock getAllAreas to return one area and tasks to return empty.
// - Expectations:
//   * The area name appears in the document.
//   * The Areas button label includes the count (Areas (1)).
//   * The Areas view is the default and the Areas button has aria-pressed="true".
test('zeigt Areas nach dem Laden und aktualisiert die Areas-Zahl im Button', async () => {
  getAllAreas.mockResolvedValue({ areas: [{ id: 'a1', name: 'Area 1', size: 42 }] })
  getAllTasksAction.mockResolvedValue([])

  render(<Page />)

  // warten bis die Area gerendert ist
  expect(await screen.findByText('Area 1')).toBeInTheDocument()

  // Button zeigt die korrekte Anzahl
  expect(screen.getByRole('button', { name: /Areas \(1\)/ })).toBeInTheDocument()
  // Default-View ist 'areas' -> aria-pressed true
  const areasButton = screen.getByRole('button', { name: /Areas \(1\)/ })
  expect(areasButton).toHaveAttribute('aria-pressed', 'true')
})

// Test: Switch to Tasks view and ensure tasks with due dates are shown and formatted.
// - Setup: no areas, one task with a specific due ISO date.
// - Expectations:
//   * Clicking the Tasks button shows the task name.
//   * A "Due" label appears (localized string "Fällig:").
//   * The due date is displayed in de-DE format (e.g. "17.11.2025").
test('wechselt zur Tasks-Ansicht und zeigt Tasks mit Fälligkeitsdatum', async () => {
  getAllAreas.mockResolvedValue({ areas: [] })
  const dueIso = '2025-11-17T00:00:00.000Z'
  getAllTasksAction.mockResolvedValue({
    tasks: [
      {
        id: "t1",
        name: "Task X",
        description: "Beschreibung",
        creatorId: null,
        createdAt: new Date().toISOString(),
        dueTo: dueIso,
        areaId: null,
      },
    ],
  });

  render(<Page />)

  // Warte auf den Tasks-Button (ohne exakte Count-Match), robust gegenüber asynchronen Count-Updates
  const tasksButton = await screen.findByRole('button', { name: /Tasks/ })
  fireEvent.click(tasksButton)

  // Task-Name erscheint
  expect(await screen.findByText('Task X')).toBeInTheDocument()
  // Fälligkeitsanzeige (de-DE Format) erscheint
  expect(screen.getByText(/Fällig:/)).toBeInTheDocument()
  // Prüfe Datumsteil (konkretes Format '17.11.2025' sollte erscheinen)
  expect(screen.getByText(/17\.11\.2025/)).toBeInTheDocument()
})

// Test: Show an error message when loading fails.
// - Setup: both area and task actions reject with an error.
// - Expectation: an error message containing the error text is rendered.
test('zeigt Fehlermeldung wenn Laden fehlschlägt', async () => {
  // Mock console.error to suppress expected error output
  const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})

  getAllAreas.mockRejectedValue(new Error('boom'))
  getAllTasksAction.mockRejectedValue(new Error('boom'))

  render(<Page />)

  // Fehler wird angezeigt
  expect(await screen.findByText(/Fehler: boom/)).toBeInTheDocument()

  // Restore console.error
  consoleErrorSpy.mockRestore()
})