// FMST-35
import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

// Mock the async DB actions so real API/database calls aren’t made
jest.mock('../src/app/tools/actions', () => ({
  loadTools: jest.fn(),
  storeTools: jest.fn(),
}))

import Page from '../src/app/tools/page'
import { loadTools, storeTools } from '../src/app/tools/actions'

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
})
