import { render, screen } from '@testing-library/react'
import { Heart } from 'lucide-react'

import { Icon } from './icon'

describe('Icon component', () => {
	it('renders the icon with default size', () => {
		render(<Icon IconComponent={Heart} data-testid='icon' />)
		const svg = screen.getByTestId('icon')
		expect(svg).toBeInTheDocument()
		expect(svg).toHaveClass('size-5')
	})

	it('renders with xs size', () => {
		render(<Icon IconComponent={Heart} size='xs' data-testid='icon' />)
		expect(screen.getByTestId('icon')).toHaveClass('size-3')
	})

	it('renders with sm size', () => {
		render(<Icon IconComponent={Heart} size='sm' data-testid='icon' />)
		expect(screen.getByTestId('icon')).toHaveClass('size-4')
	})

	it('renders with lg size', () => {
		render(<Icon IconComponent={Heart} size='lg' data-testid='icon' />)
		expect(screen.getByTestId('icon')).toHaveClass('size-6')
	})

	it('renders with xl size', () => {
		render(<Icon IconComponent={Heart} size='xl' data-testid='icon' />)
		expect(screen.getByTestId('icon')).toHaveClass('size-8')
	})

	it('merges custom className with size class', () => {
		render(<Icon IconComponent={Heart} className='custom-class' data-testid='icon' />)
		const svg = screen.getByTestId('icon')
		expect(svg).toHaveClass('custom-class')
		expect(svg).toHaveClass('size-5')
	})

	it('passes through LucideProps', () => {
		render(<Icon IconComponent={Heart} strokeWidth={3} data-testid='icon' />)
		expect(screen.getByTestId('icon')).toHaveAttribute('stroke-width', '3')
	})

	it('renders with fill prop', () => {
		render(<Icon IconComponent={Heart} fill='currentColor' data-testid='icon' />)
		expect(screen.getByTestId('icon')).toHaveAttribute('fill', 'currentColor')
	})

	it('renders with color prop', () => {
		const { container } = render(<Icon IconComponent={Heart} color='red' data-testid='icon' />)
		const svg = container.querySelector('svg')
		expect(svg).toBeInTheDocument()
		expect(svg).toHaveAttribute('data-testid', 'icon')
	})
})
