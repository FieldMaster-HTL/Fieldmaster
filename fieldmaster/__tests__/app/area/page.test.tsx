import '@testing-library/jest-dom'
import { render, screen } from '@testing-library/react'
import Page from '../src/app/area/page'

describe('Page', () => {
    it('renders a heading', () => {
        render(<Page />)

        const heading = screen.getByRole('heading', { level: 1, name: 'Home' })

        expect(heading).toBeInTheDocument()
    })
})