import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Page from '../src/app/page'

describe('Page', () => {
    it('renders a heading', () => {
        render(<Page />)

    // app/page currently renders the app title 'Fieldmaster' as the main heading
    const heading = screen.getByRole('heading', { level: 1, name: 'Fieldmaster' })

        expect(heading).toBeInTheDocument()
    })
})