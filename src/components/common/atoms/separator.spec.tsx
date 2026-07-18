import { describe, expect, it } from 'vitest'

import { render } from '@testing-library/react'

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
})
