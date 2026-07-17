import { render, screen } from '@testing-library/react'

import { SignPage } from './sign-page'

vi.mock('next-intl', () => ({
	useTranslations: () => (key: string) => key,
}))

vi.mock('@molecules/logo', () => ({
	Logo: () => <div data-testid='logo' />,
}))

vi.mock('@auth/components/sign-google', () => ({
	SignWithGoogle: ({ isLoading, disabled }: { isLoading: boolean; disabled?: boolean }) => (
		<button data-testid='sign-google' data-loading={isLoading} disabled={disabled}>
			google
		</button>
	),
}))

vi.mock('@auth/components/sign-magic-link', () => ({
	SignMagicLink: ({ disabled }: { disabled?: boolean }) => (
		<div data-testid='sign-magic-link' data-disabled={disabled}>
			magic-link
		</div>
	),
}))

describe('SignPage', () => {
	it('renders the title and subtitle', () => {
		render(<SignPage />)
		expect(screen.getByText('title')).toBeInTheDocument()
		expect(screen.getByText('subtitle')).toBeInTheDocument()
	})

	it('renders the magic link and google sign-in options', () => {
		render(<SignPage />)
		expect(screen.getByTestId('sign-magic-link')).toBeInTheDocument()
		expect(screen.getByTestId('sign-google')).toBeInTheDocument()
	})

	it('renders the logo', () => {
		render(<SignPage />)
		expect(screen.getByTestId('logo')).toBeInTheDocument()
	})

	it('does not mark either sign-in option as loading/disabled initially', () => {
		render(<SignPage />)
		expect(screen.getByTestId('sign-google')).toHaveAttribute('data-loading', 'false')
		expect(screen.getByTestId('sign-magic-link')).toHaveAttribute('data-disabled', 'false')
		expect(screen.getByTestId('sign-google')).not.toBeDisabled()
	})
})
