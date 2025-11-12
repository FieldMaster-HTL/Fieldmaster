import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

jest.mock('../src/app/tools/actions', () => ({
  loadTools: jest.fn(),
  storeTools: jest.fn(),
}))

import Page from '../src/app/tools/page'
import { loadTools, storeTools } from '../src/app/tools/actions'

afterEach(() => jest.clearAllMocks())

describe('Tools page', () => {
  it('rendert Titel, Button und leere Liste korrekt', async () => {
    loadTools.mockResolvedValue([])

    render(<Page />)
    await waitFor(() => expect(loadTools).toHaveBeenCalled())

    expect(screen.getByRole('heading', { name: /tools/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /create tool/i })).toBeInTheDocument()
  })

  it('öffnet das Modal und ruft storeTools beim Speichern auf', async () => {
    loadTools.mockResolvedValue([])
    storeTools.mockResolvedValue(undefined)

    render(<Page />)
    await waitFor(() => expect(loadTools).toHaveBeenCalled())

    fireEvent.click(screen.getByRole('button', { name: /create tool/i }))

    fireEvent.change(screen.getByPlaceholderText('Tool-Name'), { target: { value: 'Bohrer' } })
    fireEvent.change(screen.getByDisplayValue('Maschine'), { target: { value: 'Handwerkzeug' } })

    fireEvent.click(screen.getByRole('button', { name: /speichern/i }))

    await waitFor(() => {
      expect(storeTools).toHaveBeenCalledWith(
        { name: 'Bohrer', category: 'Handwerkzeug' },
        true
      )
    })
  })
})
