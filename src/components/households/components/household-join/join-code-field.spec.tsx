import { useForm } from 'react-hook-form'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { JoinCodeField } from './join-code-field'

function TestWrapper({ disabled }: { disabled?: boolean }) {
	const { control } = useForm({ defaultValues: { code: '' } })
	return <JoinCodeField control={control} disabled={disabled} label='Invite code' placeholder='ABC123' />
}

describe('JoinCodeField', () => {
	it('renders the label and input', () => {
		render(<TestWrapper />)
		expect(screen.getByText('Invite code')).toBeInTheDocument()
		expect(screen.getByPlaceholderText('ABC123')).toBeInTheDocument()
	})

	it('uppercases entered text', async () => {
		const user = userEvent.setup()
		render(<TestWrapper />)

		await user.type(screen.getByPlaceholderText('ABC123'), 'abc123')

		expect(screen.getByPlaceholderText('ABC123')).toHaveValue('ABC123')
	})

	it('disables the input when disabled', () => {
		render(<TestWrapper disabled />)
		expect(screen.getByPlaceholderText('ABC123')).toBeDisabled()
	})

	it('does not show an error by default', () => {
		render(<TestWrapper />)
		expect(screen.queryByRole('alert')).not.toBeInTheDocument()
	})
})
