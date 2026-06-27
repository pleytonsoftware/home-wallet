import { describe, expect, it } from 'vitest'

import { fireEvent, render } from '@testing-library/react'

import { Input } from './input'

describe('Input', () => {
	it('renders the input with the expected slot attribute and forwarded props', () => {
		const { container } = render(<Input className='custom' placeholder='Email' type='email' />)
		const input = container.querySelector('input[data-slot="input"]') as HTMLInputElement

		expect(input).toBeInTheDocument()
		expect(input).toHaveAttribute('type', 'email')
		expect(input).toHaveAttribute('placeholder', 'Email')
		expect(input).toHaveClass('custom')
	})

	it('supports disabled and aria-invalid states', () => {
		const { container } = render(<Input disabled aria-invalid='true' value='abc' readOnly />)
		const input = container.querySelector('input[data-slot="input"]') as HTMLInputElement

		expect(input).toBeDisabled()
		expect(input).toHaveAttribute('aria-invalid', 'true')
		expect(input.value).toBe('abc')
	})

	it('handles value changes', () => {
		const handleChange = vi.fn()
		const { container } = render(<Input onChange={handleChange} />)
		const input = container.querySelector('input[data-slot="input"]') as HTMLInputElement

		fireEvent.change(input, { target: { value: 'hello' } })

		expect(handleChange).toHaveBeenCalled()
		expect(input.value).toBe('hello')
	})
})
