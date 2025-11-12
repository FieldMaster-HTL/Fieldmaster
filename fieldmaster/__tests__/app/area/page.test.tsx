import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Page from '../../../src/app/area/page'

jest.mock('../../../src/app/area/actions', () => ({
    createArea: jest.fn(() => Promise.resolve([{ id: '3', name: 'Neues Feld', size: 42.5 }])),
    getAllAreas: jest.fn(() => Promise.resolve([
        { id: '1', name: 'Testfeld', size: 123.45 },
        { id: '2', name: 'Acker', size: 99 }
    ])),
}))

describe('Area page', () => {
    it('renders heading and inputs', () => {
        render(<Page />)
        expect(screen.getByRole('heading', { level: 1, name: 'Area anlegen' })).toBeInTheDocument()
        expect(screen.getByLabelText('Feldname')).toBeInTheDocument()
        expect(screen.getByLabelText('Größe (m²)')).toBeInTheDocument()
    })

    it('renders area list from getAllAreas', async () => {
        render(<Page />)
        await waitFor(() => {
            expect(screen.getByText('Testfeld — 123.45 m²')).toBeInTheDocument()
            expect(screen.getByText('Acker — 99 m²')).toBeInTheDocument()
        })
    })

    it('submits the form and calls createArea with number as string', async () => {
        const { createArea } = require('../../../src/app/area/actions')
        render(<Page />)
        const nameInput = screen.getByLabelText('Feldname') as HTMLInputElement
        const sizeInput = screen.getByLabelText('Größe (m²)') as HTMLInputElement
        const submitButton = screen.getByRole('button', { name: 'Anlegen' })
        fireEvent.change(nameInput, { target: { value: 'Neues Feld' } })
        fireEvent.change(sizeInput, { target: { value: '42.5' } })
        fireEvent.click(submitButton)
        await waitFor(() => {
            expect(createArea).toHaveBeenCalledWith('Neues Feld', '42.5')
        })
    })
})