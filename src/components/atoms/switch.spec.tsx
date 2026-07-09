import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { Switch } from './switch'

describe('Switch', () => {
	it('renders with data-slot', () => {
		render(<Switch data-testid='switch' />)
		expect(screen.getByTestId('switch')).toHaveAttribute('data-slot', 'switch')
	})

	it('renders as a button with role', () => {
		render(<Switch data-testid='switch' />)
		const el = screen.getByTestId('switch')
		expect(el).toHaveAttribute('role', 'switch')
	})

	it('defaults to unchecked', () => {
		render(<Switch data-testid='switch' />)
		expect(screen.getByTestId('switch')).toHaveAttribute('data-state', 'unchecked')
	})

	it('renders checked when defaultChecked is true', () => {
		render(<Switch data-testid='switch' defaultChecked />)
		expect(screen.getByTestId('switch')).toHaveAttribute('data-state', 'checked')
	})

	it('toggles on click', async () => {
		const user = userEvent.setup()
		render(<Switch data-testid='switch' />)
		const el = screen.getByTestId('switch')

		expect(el).toHaveAttribute('data-state', 'unchecked')
		await user.click(el)
		expect(el).toHaveAttribute('data-state', 'checked')
		await user.click(el)
		expect(el).toHaveAttribute('data-state', 'unchecked')
	})

	it('calls onCheckedChange when toggled', async () => {
		const user = userEvent.setup()
		const onCheckedChange = vi.fn()
		render(<Switch data-testid='switch' onCheckedChange={onCheckedChange} />)

		await user.click(screen.getByTestId('switch'))
		expect(onCheckedChange).toHaveBeenCalledWith(true)

		await user.click(screen.getByTestId('switch'))
		expect(onCheckedChange).toHaveBeenCalledWith(false)
	})

	it('renders thumb with data-slot', () => {
		const { container } = render(<Switch />)
		const thumb = container.querySelector('[data-slot="switch-thumb"]')
		expect(thumb).toBeInTheDocument()
	})

	it('defaults to size default', () => {
		render(<Switch data-testid='switch' />)
		expect(screen.getByTestId('switch')).toHaveAttribute('data-size', 'default')
	})

	it('renders sm size', () => {
		render(<Switch data-testid='switch' size='sm' />)
		expect(screen.getByTestId('switch')).toHaveAttribute('data-size', 'sm')
	})

	it('merges custom className', () => {
		render(<Switch data-testid='switch' className='custom-switch' />)
		expect(screen.getByTestId('switch')).toHaveClass('custom-switch')
	})

	it('can be disabled', async () => {
		const user = userEvent.setup()
		const onCheckedChange = vi.fn()
		render(<Switch data-testid='switch' disabled onCheckedChange={onCheckedChange} />)

		const el = screen.getByTestId('switch')
		expect(el).toBeDisabled()

		await user.click(el)
		expect(onCheckedChange).not.toHaveBeenCalled()
		expect(el).toHaveAttribute('data-state', 'unchecked')
	})

	it('supports controlled checked prop', async () => {
		const user = userEvent.setup()
		const onCheckedChange = vi.fn()
		render(<Switch data-testid='switch' checked={false} onCheckedChange={onCheckedChange} />)

		await user.click(screen.getByTestId('switch'))
		expect(onCheckedChange).toHaveBeenCalledWith(true)
	})

	it('has accessible name via aria-label', () => {
		render(<Switch data-testid='switch' aria-label='Toggle notifications' />)
		expect(screen.getByTestId('switch')).toHaveAccessibleName('Toggle notifications')
	})
})
