// FMST-35
import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

// Mock the async DB actions so real API/database calls aren't made
jest.mock('../src/app/tools/actions', () => ({
  loadTools: jest.fn(),
  storeTools: jest.fn(),
  updateTool: jest.fn(),
}))

import Page from '../src/app/tools/page'
import { loadTools, storeTools, updateTool } from '../src/app/tools/actions'

// Reset mocks after each test
afterEach(() => jest.clearAllMocks())

describe('Tools page', () => {
  it('renders title, button, and empty list correctly', async () => {
    // No tools in the mock DB
    loadTools.mockResolvedValue([])

    render(<Page />)

    // Wait for initial fetch
    await waitFor(() => expect(loadTools).toHaveBeenCalled())

    // Check for title and "Create Tool" button
    expect(screen.getByRole('heading', { name: /tools/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create tool/i })).toBeInTheDocument()
  })

  it('opens the modal and calls storeTools when saving a new tool', async () => {
    // Start with empty tools list
    loadTools.mockResolvedValue([])
    storeTools.mockResolvedValue(undefined)

    render(<Page />)
    await waitFor(() => expect(loadTools).toHaveBeenCalled())

    // Open the modal
    fireEvent.click(screen.getByRole('button', { name: /create tool/i }))

    // Fill in the form inputs
    fireEvent.change(screen.getByPlaceholderText('Tool-Name'), { target: { value: 'Bohrer' } })
    fireEvent.change(screen.getByDisplayValue('Maschine'), { target: { value: 'Handwerkzeug' } })

    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: /speichern/i }))

    // Verify that storeTools was called with the correct arguments
    await waitFor(() => {
      expect(storeTools).toHaveBeenCalledWith(
        { name: 'Bohrer', category: 'Handwerkzeug' },
        true
      )
    })
  })

  // FMST-46: Test für die Bearbeitungsfunktion von Tools
  it('opens edit modal and updates tool when saving changes', async () => {
    // Mock initial tools data
    const mockTools = [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Traktor',
        category: 'Maschine',
        available: true,
      },
      {
        id: '123e4567-e89b-12d3-a456-426614174001',
        name: 'Schaufel',
        category: 'Handwerkzeug',
        available: false,
      }
    ]

    loadTools.mockResolvedValue(mockTools)
    
    // Mock the update to return the updated tool
    const updatedTool = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Großer Traktor',
      category: 'Maschine',
      available: false,
    }
    updateTool.mockResolvedValue({ tool: updatedTool, error: null })

    render(<Page />)
    
    // Wait for tools to load
    await waitFor(() => expect(loadTools).toHaveBeenCalled())

    // Verify that the tool is displayed in the table using data-testid
    const table = screen.getByTestId('tools-table')
    expect(table).toBeInTheDocument()
    
    // Find and click the "Bearbeiten" button for the first tool
    const editButtons = screen.getAllByRole('button', { name: /bearbeite/i })
    fireEvent.click(editButtons[0])

    // Wait for modal to open
    await waitFor(() => {
      expect(screen.getByText('Tool bearbeiten')).toBeInTheDocument()
    })

    // Verify that the form fields are pre-filled with current values
    const nameInput = screen.getByDisplayValue('Traktor')
    const categorySelect = screen.getByDisplayValue('Maschine')
    const availableCheckbox = screen.getByRole('checkbox')

    expect(nameInput).toBeInTheDocument()
    expect(categorySelect).toBeInTheDocument()
    expect(availableCheckbox).toBeChecked()

    // Change the tool name
    fireEvent.change(nameInput, { target: { value: 'Großer Traktor' } })
    
    // Change the availability status
    fireEvent.click(availableCheckbox)

    // Click the save button in the modal
    const saveButtons = screen.getAllByRole('button', { name: /speichern/i })
    const modalSaveButton = saveButtons[saveButtons.length - 1] // Get the last one (from edit modal)
    fireEvent.click(modalSaveButton)

    // Verify that updateTool was called with correct parameters
    await waitFor(() => {
      expect(updateTool).toHaveBeenCalledWith(
        '123e4567-e89b-12d3-a456-426614174000',
        'Großer Traktor',
        'Maschine',
        false
      )
    })

    // Verify success message is displayed
    await waitFor(() => {
      expect(screen.getByText('Tool erfolgreich gespeichert.')).toBeInTheDocument()
    })
  })

  it('closes edit modal when cancel button is clicked', async () => {
    const mockTools = [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Traktor',
        category: 'Maschine',
        available: true,
      }
    ]

    loadTools.mockResolvedValue(mockTools)

    render(<Page />)
    
    // Wait for tools to load and table to appear
    await waitFor(() => {
      expect(screen.queryByTestId('tools-table')).toBeInTheDocument()
    })

    // Open edit modal using the first edit button
    const editButtons = screen.getAllByRole('button', { name: /bearbeite/i })
    fireEvent.click(editButtons[0])

    await waitFor(() => {
      expect(screen.getByText('Tool bearbeiten')).toBeInTheDocument()
    })

    // Click cancel button
    const cancelButtons = screen.getAllByRole('button', { name: /abbrechen/i })
    const modalCancelButton = cancelButtons[cancelButtons.length - 1]
    fireEvent.click(modalCancelButton)

    // Verify modal is closed
    await waitFor(() => {
      expect(screen.queryByText('Tool bearbeiten')).not.toBeInTheDocument()
    })

    // Verify updateTool was NOT called
    expect(updateTool).not.toHaveBeenCalled()
  })
})
