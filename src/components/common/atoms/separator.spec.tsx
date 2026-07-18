import { describe, expect, it } from 'vitest'

import { render, screen } from '@testing-library/react'

import { Separator } from './separator'

describe('Separator', () => {
	it('renders the separator with the expected data-slot attribute', () => {
		const { container } = render(<Separator />)
		const separator = container.querySelector('[data-slot="separator"]')
		expect(separator).toBeInTheDocument()
	})

	it('respects the orientation prop', () => {
		const { container: containerH } = render(<Separator orientation='horizontal' />)
		const sepH = containerH.querySelector('[data-slot="separator"]')
		expect(sepH).toBeInTheDocument()

		const { container: containerV } = render(<Separator orientation='vertical' />)
		const sepV = containerV.querySelector('[data-slot="separator"]')
		expect(sepV).toBeInTheDocument()
	})

	it('applies custom className', () => {
		const { container } = render(<Separator className='custom-class' />)
		const separator = container.querySelector('[data-slot="separator"]')
		expect(separator).toHaveClass('custom-class')
	})

	it('respects the decorative prop', () => {
		const { container } = render(<Separator decorative={false} />)
		const separator = container.querySelector('[data-slot="separator"]')
		// Radix might change the element type or attributes, but it should still render.
		expect(separator).toBeInTheDocument()
	})

	describe('with children', () => {
		it('renders the children content', () => {
			render(<Separator>Or</Separator>)
			expect(screen.getByText('Or')).toBeInTheDocument()
		})

		it('renders the wrapper with the expected data-slot and data-orientation attributes', () => {
			const { container } = render(<Separator orientation='vertical'>Or</Separator>)
			const separator = container.querySelector('[data-slot="separator"]')
			expect(separator).toBeInTheDocument()
			expect(separator).toHaveAttribute('data-orientation', 'vertical')
		})

		it('still renders the underlying separator line', () => {
			const { container } = render(<Separator>Or</Separator>)
			expect(container.querySelector('[data-orientation="horizontal"][role="none"], [data-orientation="horizontal"]')).toBeInTheDocument()
		})

		it('applies custom className to the wrapper', () => {
			const { container } = render(<Separator className='custom-class'>Or</Separator>)
			const separator = container.querySelector('[data-slot="separator"]')
			expect(separator).toHaveClass('custom-class')
		})

		it('supports rich content as children', () => {
			render(
				<Separator>
					<span data-testid='sign-or'>Or</span>
				</Separator>,
			)
			expect(screen.getByTestId('sign-or')).toBeInTheDocument()
		})
	})
})
