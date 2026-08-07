import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Toggle } from './toggle'

describe('Toggle', () => {
	it('renders its children with the toggle data-slot', () => {
		render(<Toggle>Bold</Toggle>)
		expect(screen.getByRole('button', { name: 'Bold' })).toHaveAttribute('data-slot', 'toggle')
	})

	it('starts unpressed by default', () => {
		render(<Toggle>Bold</Toggle>)
		const toggle = screen.getByRole('button')
		expect(toggle).toHaveAttribute('aria-pressed', 'false')
		expect(toggle).toHaveAttribute('data-state', 'off')
	})

	it('renders pressed when defaultPressed is set', () => {
		render(<Toggle defaultPressed>Bold</Toggle>)
		const toggle = screen.getByRole('button')
		expect(toggle).toHaveAttribute('aria-pressed', 'true')
		expect(toggle).toHaveAttribute('data-state', 'on')
	})

	it('toggles pressed state on click', async () => {
		const user = userEvent.setup()
		render(<Toggle>Bold</Toggle>)
		const toggle = screen.getByRole('button')

		await user.click(toggle)
		expect(toggle).toHaveAttribute('aria-pressed', 'true')

		await user.click(toggle)
		expect(toggle).toHaveAttribute('aria-pressed', 'false')
	})

	it('calls onPressedChange when clicked', async () => {
		const user = userEvent.setup()
		const onPressedChange = vi.fn()
		render(<Toggle onPressedChange={onPressedChange}>Bold</Toggle>)

		await user.click(screen.getByRole('button'))

		expect(onPressedChange).toHaveBeenCalledWith(true)
	})

	it('does not toggle when disabled', async () => {
		const user = userEvent.setup()
		render(<Toggle disabled>Bold</Toggle>)
		const toggle = screen.getByRole('button')

		await user.click(toggle)

		expect(toggle).toHaveAttribute('aria-pressed', 'false')
		expect(toggle).toBeDisabled()
	})

	it('applies the default variant and size classes', () => {
		render(<Toggle>Bold</Toggle>)
		expect(screen.getByRole('button')).toHaveClass('bg-transparent', 'h-9', 'min-w-9')
	})

	it('applies the outline variant classes', () => {
		render(<Toggle variant='outline'>Bold</Toggle>)
		expect(screen.getByRole('button')).toHaveClass('border', 'border-input', 'shadow-xs')
	})

	it('applies size classes for sm and lg', () => {
		const { rerender } = render(<Toggle size='sm'>Bold</Toggle>)
		expect(screen.getByRole('button')).toHaveClass('h-8', 'min-w-8')

		rerender(<Toggle size='lg'>Bold</Toggle>)
		expect(screen.getByRole('button')).toHaveClass('h-10', 'min-w-10')
	})

	it('merges a custom className with the variant classes', () => {
		render(<Toggle className='ml-auto'>Bold</Toggle>)
		expect(screen.getByRole('button')).toHaveClass('ml-auto', 'bg-transparent')
	})
})
