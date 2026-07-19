/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import { useSignOut } from '@auth/hooks/use-signout.hook'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { HouseholdsLayoutHeader } from './households-layout-header'

vi.mock('next-intl', () => ({
	useTranslations: () => (key: string) => key,
}))

vi.mock('next/image', () => ({
	default: (props: React.ComponentProps<'img'>) => <img {...props} />,
}))

vi.mock('@auth/hooks/use-signout.hook', () => ({
	useSignOut: vi.fn(),
}))

const user = { name: 'Jane Doe', email: 'jane@example.com', image: null }

describe('HouseholdsLayoutHeader', () => {
	const signOut = vi.fn()

	beforeEach(() => {
		signOut.mockClear()
		vi.mocked(useSignOut).mockReturnValue(signOut)
	})

	it('renders the app name', () => {
		render(<HouseholdsLayoutHeader user={user} />)
		expect(screen.getByRole('heading', { name: process.env.NEXT_PUBLIC_APP_NAME })).toBeInTheDocument()
	})

	it('renders the user avatar trigger', () => {
		render(<HouseholdsLayoutHeader user={user} />)
		expect(screen.getByText('JD')).toBeInTheDocument()
	})

	it('does not show the dropdown menu before opening', () => {
		render(<HouseholdsLayoutHeader user={user} />)
		expect(screen.queryByRole('menu')).not.toBeInTheDocument()
	})

	it('opens the dropdown menu with Profile, Settings, and sign-out items', async () => {
		const userSession = userEvent.setup()
		render(<HouseholdsLayoutHeader user={user} />)

		await userSession.click(screen.getByText('JD'))

		expect(screen.getByRole('menu')).toBeInTheDocument()
		expect(screen.queryByText('Profile')).not.toBeInTheDocument()
		expect(screen.queryByText('Settings')).not.toBeInTheDocument()
		expect(screen.getByText('sign-out')).toBeInTheDocument()
	})

	it('calls the sign out hook when the sign-out item is clicked', async () => {
		const userSession = userEvent.setup()
		render(<HouseholdsLayoutHeader user={user} />)

		await userSession.click(screen.getByText('JD'))
		await userSession.click(screen.getByText('sign-out'))

		expect(signOut).toHaveBeenCalledTimes(1)
	})
})
