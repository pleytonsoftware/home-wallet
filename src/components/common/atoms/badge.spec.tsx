import { render, screen } from '@testing-library/react'

import { Badge } from './badge'

describe('Badge', () => {
	it('renders its children', () => {
		render(<Badge>Admin</Badge>)
		expect(screen.getByText('Admin')).toBeInTheDocument()
	})

	it('applies the default variant classes when no variant is given', () => {
		render(<Badge>Admin</Badge>)
		expect(screen.getByText('Admin')).toHaveClass('bg-primary/10', 'text-primary')
	})

	it('applies the secondary variant classes', () => {
		render(<Badge variant='secondary'>Member</Badge>)
		expect(screen.getByText('Member')).toHaveClass('bg-secondary', 'text-secondary-foreground')
	})

	it('merges a custom className with the variant classes', () => {
		render(<Badge className='ml-auto'>Admin</Badge>)
		expect(screen.getByText('Admin')).toHaveClass('ml-auto', 'bg-primary/10')
	})
})
