import { useForm } from 'react-hook-form'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { SwitchField } from './switch-field'

function TestWrapper({ disabled = false, defaultValue = false }: { disabled?: boolean; defaultValue?: boolean }) {
	const { control } = useForm({ defaultValues: { enabled: defaultValue } })
	return <SwitchField control={control} name='enabled' label='Enable feature' description='Turns the feature on' disabled={disabled} />
}

describe('SwitchField', () => {
	it('renders the label and description', () => {
		render(<TestWrapper />)
		expect(screen.getByText('Enable feature')).toBeInTheDocument()
		expect(screen.getByText('Turns the feature on')).toBeInTheDocument()
	})

	it('renders the switch unchecked by default', () => {
		render(<TestWrapper />)
		expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'false')
	})

	it('reflects the form default value', () => {
		render(<TestWrapper defaultValue />)
		expect(screen.getByRole('switch')).toHaveAttribute('aria-checked', 'true')
	})

	it('toggles when clicked', async () => {
		const user = userEvent.setup()
		render(<TestWrapper />)

		const control = screen.getByRole('switch')
		expect(control).toHaveAttribute('aria-checked', 'false')

		await user.click(control)
		expect(control).toHaveAttribute('aria-checked', 'true')
	})

	it('disables the switch when disabled', () => {
		render(<TestWrapper disabled />)
		expect(screen.getByRole('switch')).toBeDisabled()
	})

	it('does not toggle when disabled', async () => {
		const user = userEvent.setup()
		render(<TestWrapper disabled />)

		const control = screen.getByRole('switch')
		await user.click(control)
		expect(control).toHaveAttribute('aria-checked', 'false')
	})
})
