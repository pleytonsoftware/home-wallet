import { useSearchParams } from 'next/navigation'

import { signIn } from 'next-auth/react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { SignWithGoogle } from './sign-google'

vi.mock('next-intl', () => ({
	useTranslations: () => (key: string) => key,
}))

vi.mock('next/navigation', () => ({
	useSearchParams: vi.fn(() => new URLSearchParams()),
}))

vi.mock('next-auth/react', () => ({
	signIn: vi.fn(),
}))

vi.mock('@assets/icons/google.svg', () => ({
	default: () => <svg data-testid='google-icon' />,
}))

function renderComponent(props: Partial<React.ComponentProps<typeof SignWithGoogle>> = {}) {
	const setIsLoading = vi.fn()
	const setError = vi.fn()
	render(<SignWithGoogle isLoading={false} setIsLoading={setIsLoading} setError={setError} {...props} />)
	return { setIsLoading, setError }
}

describe('SignWithGoogle', () => {
	beforeEach(() => {
		vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams() as ReturnType<typeof useSearchParams>)
		vi.mocked(signIn).mockResolvedValue(undefined)
	})

	it('renders the sign-with-google label', () => {
		renderComponent()
		expect(screen.getByText('sign-with-google')).toBeInTheDocument()
	})

	it('shows the signing-in label while loading', () => {
		renderComponent({ isLoading: true })
		expect(screen.getByText('signing-in')).toBeInTheDocument()
	})

	it('calls signIn with google and the resolved callback url on click', async () => {
		const user = userEvent.setup()
		renderComponent()

		await user.click(screen.getByRole('button'))

		expect(signIn).toHaveBeenCalledWith('google', { callbackUrl: expect.any(String) })
	})

	it('sets loading state and clears errors before signing in', async () => {
		const user = userEvent.setup()
		const { setIsLoading, setError } = renderComponent()

		await user.click(screen.getByRole('button'))

		expect(setIsLoading).toHaveBeenCalledWith(true)
		expect(setError).toHaveBeenCalledWith(null)
	})

	it('sets an error and stops loading when signIn rejects', async () => {
		vi.mocked(signIn).mockRejectedValueOnce(new Error('boom'))
		const user = userEvent.setup()
		const { setIsLoading, setError } = renderComponent()

		await user.click(screen.getByRole('button'))

		expect(setError).toHaveBeenCalledWith('boom')
		expect(setIsLoading).toHaveBeenCalledWith(false)
	})

	it('is disabled when the disabled prop is set', () => {
		renderComponent({ disabled: true })
		expect(screen.getByRole('button')).toBeDisabled()
	})
})
