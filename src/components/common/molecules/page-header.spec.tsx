import { Home } from 'lucide-react'

import { render, screen } from '@testing-library/react'

import { PageHeader } from './page-header'

describe('PageHeader', () => {
	it('renders the eyebrow, title and description', () => {
		render(<PageHeader icon={Home} eyebrow='Overview' title='My households' description='Manage your shared expenses' />)

		expect(screen.getByText('Overview')).toBeInTheDocument()
		expect(screen.getByRole('heading', { level: 1, name: 'My households' })).toBeInTheDocument()
		expect(screen.getByText('Manage your shared expenses')).toBeInTheDocument()
	})

	it('renders the given icon', () => {
		const { container } = render(<PageHeader icon={Home} eyebrow='Overview' title='Title' description='Description' />)

		expect(container.querySelector('svg')).toBeInTheDocument()
	})
})
