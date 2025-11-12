import '@testing-library/jest-dom'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Page from '../../../src/app/area/page'
import { createArea, getAllAreas } from '../../../src/app/area/actions'

//Area FMST-30  / FMST-31

jest.mock('../../../src/app/area/actions', () => ({
    createArea: jest.fn().mockImplementation(() => Promise.resolve([{ id: '3', name: 'Neues Feld', size: 42.5 }])),
    getAllAreas: jest.fn().mockImplementation(() => Promise.resolve([
        { id: '1', name: 'Testfeld', size: 123.45 },
        { id: '2', name: 'Acker', size: 99 }
    ])),
}))

describe('Area page', () => {
    it('renders heading and inputs', async () => {
        render(<Page />)
        await waitFor(() => {
            expect(screen.getByRole('heading', { level: 1, name: 'Area anlegen' })).toBeInTheDocument()
        })
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
        render(<Page />)

        await waitFor(() => {
            expect(getAllAreas).toHaveBeenCalled();
        })

        const nameInput = screen.getByLabelText('Feldname') as HTMLInputElement
        const sizeInput = screen.getByLabelText('Größe (m²)') as HTMLInputElement
        const form = screen.getByTestId('area-form')
        fireEvent.change(nameInput, { target: { value: 'Neues Feld' } })
        fireEvent.change(sizeInput, { target: { value: '42.5' } })
        fireEvent.submit(form)
        await waitFor(() => {
            expect(createArea).toHaveBeenCalledWith('Neues Feld', '42.5')
        })
    })
})