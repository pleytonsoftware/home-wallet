import { render, screen } from '@testing-library/react'

import { HouseholdsHeader } from './households-header'

describe('HouseholdsHeader', () => {
	it('renders the eyebrow, title, and description', () => {
		render(<HouseholdsHeader eyebrow='Welcome' title='Your households' description='Manage your shared finances' />)

		expect(screen.getByText('Welcome')).toBeInTheDocument()
		expect(screen.getByRole('heading', { name: 'Your households' })).toBeInTheDocument()
		expect(screen.getByText('Manage your shared finances')).toBeInTheDocument()
	})
})
