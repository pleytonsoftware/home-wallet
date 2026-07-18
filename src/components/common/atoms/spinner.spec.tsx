import { render, screen } from '@testing-library/react'

import { Spinner } from './spinner'

describe('Spinner component', () => {
	it('renders with role=status', () => {
		render(<Spinner />)
		expect(screen.getByRole('status')).toBeInTheDocument()
	})

	it('renders with aria-label Loading', () => {
		render(<Spinner />)
		expect(screen.getByRole('status')).toHaveAttribute('aria-label', 'Loading')
	})

	it('sets data-slot attribute', () => {
		render(<Spinner data-testid='spinner' />)
		expect(screen.getByTestId('spinner')).toHaveAttribute('data-slot', 'spinner')
	})

	it('applies animate-spin class', () => {
		render(<Spinner data-testid='spinner' />)
		expect(screen.getByTestId('spinner')).toHaveClass('animate-spin')
	})

	it('applies base size-4 class', () => {
		render(<Spinner data-testid='spinner' />)
		expect(screen.getByTestId('spinner')).toHaveClass('size-4')
	})

	it('merges custom className', () => {
		render(<Spinner className='custom-class' data-testid='spinner' />)
		const spinner = screen.getByTestId('spinner')
		expect(spinner).toHaveClass('custom-class')
		expect(spinner).toHaveClass('size-4')
		expect(spinner).toHaveClass('animate-spin')
	})

	it('passes through SVG props', () => {
		render(<Spinner data-testid='spinner' width={32} height={32} />)
		const spinner = screen.getByTestId('spinner')
		expect(spinner).toHaveAttribute('width', '32')
		expect(spinner).toHaveAttribute('height', '32')
	})

	it('renders the Loader2Icon', () => {
		render(<Spinner data-testid='spinner' />)
		const svg = screen.getByTestId('spinner')
		expect(svg.tagName).toBe('svg')
	})
})
