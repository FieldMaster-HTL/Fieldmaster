import '@testing-library/jest-dom'
// Mock the server-side action so importing the page doesn't pull in DB/pg
jest.mock('../../../src/app/area/actions', () => ({
    createArea: jest.fn(),
}))
import { render, screen } from '@testing-library/react'
import Page from '../../../src/app/area/page'

describe('Area page', () => {
    it('renders heading and inputs', () => {
        render(<Page />)

        const heading = screen.getByRole('heading', { level: 1, name: 'Area anlegen' })
        const nameInput = screen.getByLabelText('Feldname')
        const sizeInput = screen.getByLabelText('Größe (m²)')

        expect(heading).toBeInTheDocument()
        expect(nameInput).toBeInTheDocument()
        expect(sizeInput).toBeInTheDocument()
    })

    it('has a submit button', () => {
        render(<Page />)
        const submit = screen.getByRole('button', { name: 'Anlegen' })
        expect(submit).toBeInTheDocument()
    })
})