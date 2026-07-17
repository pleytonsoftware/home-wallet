import { useSignOut } from '@auth/hooks/use-signout.hook'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { SignOutButton } from './signout'

vi.mock('next-intl', () => ({
	useTranslations: () => (key: string) => key,
}))

vi.mock('@auth/hooks/use-signout.hook', () => ({
	useSignOut: vi.fn(),
}))

describe('SignOutButton', () => {
	const signOut = vi.fn()

	beforeEach(() => {
		signOut.mockClear()
		vi.mocked(useSignOut).mockReturnValue(signOut)
	})

	it('renders the sign-out label', () => {
		render(<SignOutButton />)
		expect(screen.getByText('sign-out')).toBeInTheDocument()
	})

	it('calls the sign out hook on click', async () => {
		const user = userEvent.setup()
		render(<SignOutButton />)

		await user.click(screen.getByRole('button'))

		expect(signOut).toHaveBeenCalledTimes(1)
	})

	it('also calls a provided onClick handler', async () => {
		const onClick = vi.fn()
		const user = userEvent.setup()
		render(<SignOutButton onClick={onClick} />)

		await user.click(screen.getByRole('button'))

		expect(onClick).toHaveBeenCalledTimes(1)
	})

	it('spreads additional button props', () => {
		render(<SignOutButton disabled />)
		expect(screen.getByRole('button')).toBeDisabled()
	})
})
