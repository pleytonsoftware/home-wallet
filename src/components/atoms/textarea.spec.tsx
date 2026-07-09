import { render, screen, fireEvent } from '@testing-library/react'

import { Textarea } from './textarea'

describe('Textarea', () => {
	it('renders with data-slot', () => {
		render(<Textarea data-testid='textarea' />)
		expect(screen.getByTestId('textarea')).toHaveAttribute('data-slot', 'textarea')
	})

	it('renders as a textarea element', () => {
		render(<Textarea data-testid='textarea' />)
		expect(screen.getByTestId('textarea').tagName).toBe('TEXTAREA')
	})

	it('applies default classes', () => {
		render(<Textarea data-testid='textarea' />)
		const el = screen.getByTestId('textarea')
		expect(el).toHaveClass('flex', 'w-full', 'rounded-md', 'border', 'border-input')
	})

	it('merges custom className', () => {
		render(<Textarea data-testid='textarea' className='custom-class' />)
		expect(screen.getByTestId('textarea')).toHaveClass('custom-class', 'flex', 'w-full')
	})

	it('accepts placeholder', () => {
		render(<Textarea placeholder='Enter text' />)
		expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument()
	})

	it('handles value change', () => {
		render(<Textarea data-testid='textarea' />)
		const el = screen.getByTestId('textarea')
		fireEvent.change(el, { target: { value: 'hello' } })
		expect(el).toHaveValue('hello')
	})

	it('can be disabled', () => {
		render(<Textarea data-testid='textarea' disabled />)
		expect(screen.getByTestId('textarea')).toBeDisabled()
	})

	it('spreads additional textarea props', () => {
		render(<Textarea data-testid='textarea' rows={5} maxLength={100} />)
		const el = screen.getByTestId('textarea')
		expect(el).toHaveAttribute('rows', '5')
		expect(el).toHaveAttribute('maxlength', '100')
	})

	it('can be focused', () => {
		render(<Textarea data-testid='textarea' />)
		const el = screen.getByTestId('textarea')
		el.focus()
		expect(el).toHaveFocus()
	})

	it('renders with aria-invalid', () => {
		render(<Textarea data-testid='textarea' aria-invalid />)
		expect(screen.getByTestId('textarea')).toHaveAttribute('aria-invalid', 'true')
	})
})
