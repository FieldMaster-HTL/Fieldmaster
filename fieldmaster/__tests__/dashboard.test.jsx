/**
 * @file __tests__/dashboard.test.jsx
 *
 * Tests for src/app/dashboard/page.tsx
 */

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

test('wechselt zur Tasks-Ansicht und zeigt Tasks mit Fälligkeitsdatum', async () => {
  getAllAreas.mockResolvedValue({ areas: [] })
  const dueIso = '2025-11-17T00:00:00.000Z'
  getAllTasksAction.mockResolvedValue([
    {
      id: 't1',
      name: 'Task X',
      description: 'Beschreibung',
      creatorId: null,
      createdAt: new Date().toISOString(),
      dueTo: dueIso,
      areaId: null
    }
  ])

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

test('zeigt Fehlermeldung wenn Laden fehlschlägt', async () => {
  getAllAreas.mockRejectedValue(new Error('boom'))
  getAllTasksAction.mockRejectedValue(new Error('boom'))

  render(<Page />)

  // Fehler wird angezeigt
  expect(await screen.findByText(/Fehler: boom/)).toBeInTheDocument()
})