import { render, screen } from '@testing-library/react'

import { Skeleton } from './skeleton'

describe('Skeleton', () => {
	it('renders with data-slot', () => {
		render(<Skeleton data-testid='skeleton' />)
		expect(screen.getByTestId('skeleton')).toHaveAttribute('data-slot', 'skeleton')
	})

	it('renders as a div', () => {
		render(<Skeleton data-testid='skeleton' />)
		expect(screen.getByTestId('skeleton').tagName).toBe('DIV')
	})

	it('applies default classes', () => {
		render(<Skeleton data-testid='skeleton' />)
		const el = screen.getByTestId('skeleton')
		expect(el).toHaveClass('animate-pulse')
		expect(el).toHaveClass('rounded-md')
		expect(el).toHaveClass('bg-muted')
	})

	it('merges custom className', () => {
		render(<Skeleton data-testid='skeleton' className='w-10 h-4' />)
		const el = screen.getByTestId('skeleton')
		expect(el).toHaveClass('animate-pulse', 'rounded-md', 'bg-muted', 'w-10', 'h-4')
	})

	it('spreads additional div props', () => {
		render(<Skeleton data-testid='skeleton' role='status' aria-label='Loading' />)
		const el = screen.getByTestId('skeleton')
		expect(el).toHaveAttribute('role', 'status')
		expect(el).toHaveAttribute('aria-label', 'Loading')
	})

	it('renders children', () => {
		render(
			<Skeleton data-testid='skeleton'>
				<span>child</span>
			</Skeleton>,
		)
		expect(screen.getByText('child')).toBeInTheDocument()
	})
})
