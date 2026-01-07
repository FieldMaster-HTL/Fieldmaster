// FMST-35

import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

// Mock the actions so tests don't call the real DB
jest.mock('../src/app/task/actions', () => ({
  getAllTasksAction: jest.fn(),
  getAllAreasAction: jest.fn(),
  createTaskAction: jest.fn(),
  getAllToolsAction: jest.fn(),
  getAllTaskToolsAction: jest.fn(),
  getToolsForTaskAction: jest.fn(),
  setTaskToolsAction: jest.fn(),
  updateTaskAction: jest.fn(),
}))

import Tasks from '../src/app/task/page'
import { getAllTasksAction, getAllAreasAction, createTaskAction, getAllToolsAction, getAllTaskToolsAction, getToolsForTaskAction, setTaskToolsAction, updateTaskAction } from '../src/app/task/actions'

// default mocks for tool-related actions
getAllToolsAction.mockResolvedValue([])
getAllTaskToolsAction.mockResolvedValue([])
getToolsForTaskAction.mockResolvedValue([])
setTaskToolsAction.mockResolvedValue([])
updateTaskAction.mockResolvedValue(undefined)

afterEach(() => jest.clearAllMocks()) // clear mocks after each test

describe('Tasks page', () => {
  // Test if the page renders correctly with no tasks
  it('renders heading, inputs and empty state when no tasks', async () => {
    getAllTasksAction.mockResolvedValue([]) // mock empty tasks
    getAllAreasAction.mockResolvedValue([]) // mock empty areas

    render(<Tasks />)

    // wait for initial fetch
    await waitFor(() => expect(getAllTasksAction).toHaveBeenCalled())

    // check heading and input fields
    expect(screen.getByRole('heading', { name: /tasks/i })).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Titel der Aufgabe...')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Beschreibung (optional)...')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Enddatum (optional)')).toBeInTheDocument()

    // check empty state text
    expect(screen.getByText('Keine Aufgaben vorhanden.')).toBeInTheDocument()
  })

  // FMST-11: Test if area dropdown is rendered with areas
  it('renders area dropdown with available areas', async () => {
    const mockAreas = [
      { id: 'area-1', name: 'Feld A', size: '100m²' },
      { id: 'area-2', name: 'Feld B', size: '200m²' },
      { id: 'area-3', name: 'Feld C' },
    ]

    getAllTasksAction.mockResolvedValue([])
    getAllAreasAction.mockResolvedValue(mockAreas)

    render(<Tasks />)

    await waitFor(() => expect(getAllAreasAction).toHaveBeenCalled())

    const areaSelect = screen.getByLabelText(/feld auswählen \(optional\)/i)
    expect(areaSelect).toBeInTheDocument()

    // Check if all areas are present in the dropdown
    expect(screen.getByText('Feld A (100m²)')).toBeInTheDocument()
    expect(screen.getByText('Feld B (200m²)')).toBeInTheDocument()
    expect(screen.getByText('Feld C')).toBeInTheDocument()
    expect(screen.getByText('-- Feld auswählen (optional) --')).toBeInTheDocument()
  })

  // FMST-11: Test if creating a task with area calls the correct action
  it('calls createTaskAction with areaId when submitting form with area selected', async () => {
    const creatorClerkId = 'creator-1'
    const mockAreas = [
      { id: 'area-1', name: 'Feld A', size: '100m²' },
      { id: 'area-2', name: 'Feld B', size: '200m²' },
    ]

    localStorage.setItem('creatorClerkId', creatorClerkId)

    getAllTasksAction.mockResolvedValue([])
    getAllAreasAction.mockResolvedValue(mockAreas)
    createTaskAction.mockResolvedValue(undefined)

    render(<Tasks />)

    await waitFor(() => expect(getAllTasksAction).toHaveBeenCalled())

    const nameInput = screen.getByPlaceholderText('Titel der Aufgabe...')
    const descInput = screen.getByPlaceholderText('Beschreibung (optional)...')
    const dateInput = screen.getByPlaceholderText('Enddatum (optional)')
    const areaSelect = screen.getByLabelText(/feld auswählen \(optional\)/i)
    const button = screen.getByRole('button', { name: /hinzufügen/i })

    // fill out form with area
    fireEvent.change(nameInput, { target: { value: 'Test Task' } })
    fireEvent.change(descInput, { target: { value: 'Beschreibung' } })
    fireEvent.change(dateInput, { target: { value: '2025-11-12' } })
    fireEvent.change(areaSelect, { target: { value: 'area-1' } })

    // submit form
    fireEvent.click(button)

    // wait for createTaskAction to be called with areaId
    await waitFor(() => {
      expect(createTaskAction).toHaveBeenCalledWith(
        'Test Task',
        'Beschreibung',
        creatorClerkId,
        new Date('2025-11-12'),
        'area-1'
      )
    })
  })

  // Test if creating a task calls the correct action
  it('calls createTaskAction when submitting the new task form', async () => {
    const creatorClerkId = 'creator-1'

    localStorage.setItem('creatorClerkId', creatorClerkId)

    getAllTasksAction.mockResolvedValue([]) // no tasks initially
    getAllAreasAction.mockResolvedValue([]) // no areas
    createTaskAction.mockResolvedValue(undefined) // mock create

    render(<Tasks />)

    await waitFor(() => expect(getAllTasksAction).toHaveBeenCalled())

    const nameInput = screen.getByPlaceholderText('Titel der Aufgabe...')
    const descInput = screen.getByPlaceholderText('Beschreibung (optional)...')
    const dateInput = screen.getByPlaceholderText('Enddatum (optional)')
    const button = screen.getByRole('button', { name: /hinzufügen/i })

    // fill out form
    fireEvent.change(nameInput, { target: { value: 'Test Task' } })
    fireEvent.change(descInput, { target: { value: 'Beschreibung' } })
    fireEvent.change(dateInput, { target: { value: '2025-11-12' } })

    // submit form
    fireEvent.click(button)

    // wait for createTaskAction to be called (component uses startTransition)
    await waitFor(() => {
      expect(createTaskAction).toHaveBeenCalledWith(
        'Test Task',
        'Beschreibung',
        creatorClerkId,
        new Date('2025-11-12'),
        undefined
      )
    })
  })

  // FMST-11: Test if tasks display their associated area name
  it('displays area name in task list when task has area', async () => {
    const mockAreas = [
      { id: 'area-1', name: 'Feld A', size: '100m²' },
      { id: 'area-2', name: 'Feld B', size: '200m²' },
    ]

    const mockTasks = [
      {
        id: 'task-1',
        name: 'Task mit Feld',
        description: 'Beschreibung',
        areaId: 'area-1',
        dueTo: '2025-12-15',
        createdAt: '2025-12-10',
      },
      {
        id: 'task-2',
        name: 'Task ohne Feld',
        description: 'Keine Area',
        dueTo: '2025-12-20',
        createdAt: '2025-12-10',
      },
    ]

    getAllTasksAction.mockResolvedValue(mockTasks)
    getAllAreasAction.mockResolvedValue(mockAreas)

    render(<Tasks />)

    await waitFor(() => expect(getAllTasksAction).toHaveBeenCalled())

    // Check if task with area shows area name
    expect(screen.getByText('Task mit Feld')).toBeInTheDocument()
    expect(screen.getByText('Feld: Feld A')).toBeInTheDocument()

    // Check if task without area doesn't show area field
    expect(screen.getByText('Task ohne Feld')).toBeInTheDocument()
    const allAreaTexts = screen.queryAllByText(/^Feld:/)
    expect(allAreaTexts).toHaveLength(1) // only one task should show area
  })

  // FMST-11: Test if modal displays area name
  it('displays area name in modal when task is clicked', async () => {
    const mockAreas = [
      { id: 'area-1', name: 'Feld A', size: '100m²' },
    ]

    const mockTasks = [
      {
        id: 'task-1',
        name: 'Task mit Feld',
        description: 'Beschreibung',
        areaId: 'area-1',
        dueTo: '2025-12-15',
        createdAt: '2025-12-10T10:00:00Z',
      },
    ]

    getAllTasksAction.mockResolvedValue(mockTasks)
    getAllAreasAction.mockResolvedValue(mockAreas)

    render(<Tasks />)

    await waitFor(() => expect(getAllTasksAction).toHaveBeenCalled())

    // Click on task to open modal
    const taskItem = screen.getByText('Task mit Feld')
    fireEvent.click(taskItem)

    // Check if modal shows area name - look for the modal container specifically
    await waitFor(() => {
      const modal = screen.getByRole('heading', { name: 'Task mit Feld' }).closest('div')
      expect(modal).toHaveTextContent('Feld: Feld A')
    })
  })

  // Test error handling when createTaskAction fails
  it('displays error message when task creation fails', async () => {
    const creatorClerkId = 'creator-1'

    localStorage.setItem('creatorClerkId', creatorClerkId)

    getAllTasksAction.mockResolvedValue([])
    getAllAreasAction.mockResolvedValue([])
    createTaskAction.mockRejectedValue(new Error('Database error'))

    render(<Tasks />)

    await waitFor(() => expect(getAllTasksAction).toHaveBeenCalled())

    const nameInput = screen.getByPlaceholderText('Titel der Aufgabe...')
    const button = screen.getByRole('button', { name: /hinzufügen/i })

    // fill out form
    fireEvent.change(nameInput, { target: { value: 'Test Task' } })

    // submit form
    fireEvent.click(button)

    // wait for error message to appear
    await waitFor(() => {
      expect(screen.getByText('Failed to create task. Please try again.')).toBeInTheDocument()
    })
  })

  // FMST-11: Test if modal displays 'Unbekannt' when area not found
  it('displays "Unbekannt" in modal when area is not found', async () => {
    const mockAreas = [
      { id: 'area-1', name: 'Feld A', size: '100m²' },
    ]

    const mockTasks = [
      {
        id: 'task-1',
        name: 'Task mit unbekanntem Feld',
        description: 'Beschreibung',
        areaId: 'non-existent-area-id', // Area ID that doesn't exist
        dueTo: '2025-12-15',
        createdAt: '2025-12-10T10:00:00Z',
      },
    ]

    getAllTasksAction.mockResolvedValue(mockTasks)
    getAllAreasAction.mockResolvedValue(mockAreas)

    render(<Tasks />)

    await waitFor(() => expect(getAllTasksAction).toHaveBeenCalled())

    // Check if task list shows "Unbekannt"
    expect(screen.getByText('Feld: Unbekannt')).toBeInTheDocument()

    // Click on task to open modal
    const taskItem = screen.getByText('Task mit unbekanntem Feld')
    fireEvent.click(taskItem)

    // Check if modal also shows "Unbekannt" (now consistent with the update)
    await waitFor(() => {
      const modal = screen.getByRole('heading', { name: 'Task mit unbekanntem Feld' }).closest('div')
      expect(modal).toHaveTextContent('Feld: Unbekannt')
    })
  })

  // FMST-12: Test that assigned tools are shown as badges in the task list
  it('renders assigned tool badges for tasks', async () => {
    const mockTools = [
      { id: 'tool-1', name: 'Traktor' },
    ]
    const mockTaskTools = [
      { id: 'tt-1', taskId: 'task-1', toolId: 'tool-1' },
    ]
    const mockTasks = [
      { id: 'task-1', name: 'Task with tool' },
    ]

    getAllTasksAction.mockResolvedValue(mockTasks)
    getAllAreasAction.mockResolvedValue([])
    getAllToolsAction.mockResolvedValue(mockTools)
    getAllTaskToolsAction.mockResolvedValue(mockTaskTools)

    render(<Tasks />)

    await waitFor(() => expect(getAllTasksAction).toHaveBeenCalled())

    // Badge should display the tool name
    expect(screen.getByText('Traktor')).toBeInTheDocument()
  })

  // FMST-12: Modal should pre-select assigned tools and Save should call the actions
  it('preselects tools in modal and calls setTaskToolsAction on save', async () => {
    const mockTools = [
      { id: 'tool-1', name: 'Hoe' },
      { id: 'tool-2', name: 'Seeder' },
    ]
    const mockTasks = [
      { id: 'task-1', name: 'Editable Task', createdAt: '2025-01-01' },
    ]

    getAllTasksAction.mockResolvedValue(mockTasks)
    getAllAreasAction.mockResolvedValue([])
    getAllToolsAction.mockResolvedValue(mockTools)
    // getToolsForTaskAction returns the tools assigned to the task
    getToolsForTaskAction.mockResolvedValue([{ id: 'tool-2', name: 'Seeder' }])
    setTaskToolsAction.mockResolvedValue([])
    updateTaskAction.mockResolvedValue(undefined)

    render(<Tasks />)

    await waitFor(() => expect(getAllTasksAction).toHaveBeenCalled())

    // Open modal by clicking the task
    fireEvent.click(screen.getByText('Editable Task'))

    // Wait for modal and expect the assigned tool checkbox to be checked
    await waitFor(() => {
      const seederCheckbox = screen.getByRole('checkbox', { name: /Seeder/i })
      expect(seederCheckbox).toBeChecked()
      const hoeCheckbox = screen.getByRole('checkbox', { name: /Hoe/i })
      expect(hoeCheckbox).not.toBeChecked()
    })

    // Click Save and assert actions were called
    fireEvent.click(screen.getByText('Speichern'))

    await waitFor(() => {
      expect(updateTaskAction).toHaveBeenCalled()
      expect(setTaskToolsAction).toHaveBeenCalledWith('task-1', ['tool-2'])
    })
  })
})
