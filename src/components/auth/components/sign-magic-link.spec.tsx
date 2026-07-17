import { signIn } from 'next-auth/react'

import { useMagicLinkForm } from '@auth/hooks/use-magic-link-form.hook'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { SignMagicLink } from './sign-magic-link'

vi.mock('next-intl', () => ({
	useTranslations: () => (key: string) => key,
}))

vi.mock('next-auth/react', () => ({
	signIn: vi.fn(),
}))

function TestWrapper({ setError, disabled }: { setError: (error: string | null) => void; disabled?: boolean }) {
	const form = useMagicLinkForm()
	return <SignMagicLink setError={setError} disabled={disabled} form={form} />
}

function renderComponent(props: { disabled?: boolean } = {}) {
	const setError = vi.fn()
	render(<TestWrapper setError={setError} {...props} />)
	return { setError }
}

describe('SignMagicLink', () => {
	beforeEach(() => {
		vi.mocked(signIn).mockResolvedValue(undefined)
	})

	it('renders the email input and submit button', () => {
		renderComponent()
		expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument()
		expect(screen.getByText('sign-with-email')).toBeInTheDocument()
	})

	it('shows a validation error for an invalid email on submit', async () => {
		const user = userEvent.setup()
		renderComponent()

		await user.type(screen.getByPlaceholderText('you@example.com'), 'not-an-email')
		await user.click(screen.getByRole('button'))

		expect(await screen.findByText('Invalid email address')).toBeInTheDocument()
		expect(signIn).not.toHaveBeenCalled()
	})

	it('calls signIn with the email on valid submit', async () => {
		const user = userEvent.setup()
		renderComponent()

		await user.type(screen.getByPlaceholderText('you@example.com'), 'jane@example.com')
		await user.click(screen.getByRole('button'))

		expect(signIn).toHaveBeenCalledWith('email', expect.objectContaining({ email: 'jane@example.com' }))
	})

	it('clears the error before submitting', async () => {
		const user = userEvent.setup()
		const { setError } = renderComponent()

		await user.type(screen.getByPlaceholderText('you@example.com'), 'jane@example.com')
		await user.click(screen.getByRole('button'))

		expect(setError).toHaveBeenCalledWith(null)
	})

	it('disables the input and button when disabled', () => {
		renderComponent({ disabled: true })
		expect(screen.getByPlaceholderText('you@example.com')).toBeDisabled()
		expect(screen.getByRole('button')).toBeDisabled()
	})
})
