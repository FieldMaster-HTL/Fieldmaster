import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import Page from '@/src/app/dashboard/page'
import * as areaActions from '@/src/app/area/actions'
import * as taskActions from '@/src/app/task/actions'

jest.mock('@/src/app/area/actions')
jest.mock('@/src/app/task/actions')

describe('Dashboard Page', () => {
    const mockAreas = [
        { id: '1', name: 'Area 1', size: 100 },
        { id: '2', name: 'Area 2', size: 200 }
    ]

    const mockTasks = [
        {
            id: '1',
            name: 'Task 1',
            description: 'Description 1',
            creatorId: 'user1',
            createdAt: new Date(),
            dueTo: new Date(),
            areaId: '1'
        }
    ]

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders dashboard title', async () => {
        areaActions.getAllAreas.mockResolvedValue([])
        taskActions.getAllTasksAction.mockResolvedValue([])

        render(<Page />)
        expect(screen.getByText('Dashboard')).toBeInTheDocument()
    })

    it('loads and displays areas', async () => {
        areaActions.getAllAreas.mockResolvedValue(mockAreas)
        taskActions.getAllTasksAction.mockResolvedValue([])

        render(<Page />)

        await waitFor(() => {
            expect(screen.getByText('Area 1')).toBeInTheDocument()
            expect(screen.getByText('Area 2')).toBeInTheDocument()
        })
    })

    it('loads and displays tasks', async () => {
        areaActions.getAllAreas.mockResolvedValue([])
        taskActions.getAllTasksAction.mockResolvedValue(mockTasks)

        render(<Page />)
        const tasksButton = screen.getByRole('button', { name: /Tasks/ })
        tasksButton.click()

        await waitFor(() => {
            expect(screen.getByText('Task 1')).toBeInTheDocument()
        })
    })

    it('displays error message on load failure', async () => {
        areaActions.getAllAreas.mockRejectedValue(new Error('Load failed'))
        taskActions.getAllTasksAction.mockResolvedValue([])

        render(<Page />)

        await waitFor(() => {
            expect(screen.getByText(/Fehler.*Load failed/)).toBeInTheDocument()
        })
    })

    it('shows empty state when no areas exist', async () => {
        areaActions.getAllAreas.mockResolvedValue([])
        taskActions.getAllTasksAction.mockResolvedValue([])

        render(<Page />)

        await waitFor(() => {
            expect(screen.getByText('Keine Areas vorhanden.')).toBeInTheDocument()
        })
    })

    it('toggles between areas and tasks view', async () => {
        areaActions.getAllAreas.mockResolvedValue(mockAreas)
        taskActions.getAllTasksAction.mockResolvedValue(mockTasks)

        render(<Page />)

        await waitFor(() => {
            expect(screen.getByText('Area 1')).toBeInTheDocument()
        })

        const tasksButton = screen.getByRole('button', { name: /Tasks/ })
        tasksButton.click()

        await waitFor(() => {
            expect(screen.getByText('Task 1')).toBeInTheDocument()
        })
    })
})