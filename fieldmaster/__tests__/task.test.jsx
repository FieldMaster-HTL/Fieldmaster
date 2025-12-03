// FMST-35

import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

// Mock the actions so tests don't call the real DB
jest.mock('../src/app/task/actions', () => ({
  getAllTasksAction: jest.fn(),
  createTaskAction: jest.fn(),
  deleteTaskAction: jest.fn(),
}))

import Tasks from '../src/app/task/page'
import { getAllTasksAction, createTaskAction, deleteTaskAction } from '../src/app/task/actions'

afterEach(() => jest.clearAllMocks()) // clear mocks after each test

describe('Tasks page', () => {
  // Test if the page renders correctly with no tasks
  it('renders heading, inputs and empty state when no tasks', async () => {
    getAllTasksAction.mockResolvedValue([]) // mock empty tasks

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

  // Test if creating a task calls the correct action
  it('calls createTaskAction when submitting the new task form', async () => {
    const creatorClerkId = 'creator-1'

    localStorage.setItem('creatorClerkId', creatorClerkId)

    getAllTasksAction.mockResolvedValue([]) // no tasks initially
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
        new Date('2025-11-12')
      )
    })
  })


/*****************************************************************************/
/*********************new tests for FMST-50**********************************/
/***************************************************************************/
  /*DELETE CONFIRM MODAL APPEARS (for FMST-50)*/
  it('shows the delete confirmation modal when clicking DELETE', async () => {
    // one example task
    const tasks = [
      { 
        id: '1', 
        name: 'Testtask', 
        description: 'Lorem', 
        dueDate: null 
      },
    ]

    getAllTasksAction.mockResolvedValue(tasks)

    render(<Tasks />)

    // wait for tasks to load
    await waitFor(() => expect(getAllTasksAction).toHaveBeenCalled())

    // click DELETE button of the task
    const deleteBtn = screen.getByText('DELETE')
    fireEvent.click(deleteBtn)

    // modal should appear now
    expect(
      screen.getByText(/do you really want to delete the task/i)
    ).toBeInTheDocument()

    // task name inside modal
    expect(screen.getAllByText(/Testtask/i)[1]).toBeInTheDocument()
  })

})
