import { SidebarProvider } from '@atoms/sidebar'
import { useIsMobile } from '@hooks/use-mobile'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { SidebarUser } from './sidebar-user'

vi.mock('@hooks/use-mobile', () => ({
	useIsMobile: vi.fn(() => false),
}))

vi.mock('next-intl', () => ({
	useTranslations: () => (key: string) => key,
}))

const user = {
	name: 'Jane Doe',
	email: 'jane@example.com',
	image: null,
}

function renderSidebarUser(onSignout = vi.fn()) {
	return render(
		<SidebarProvider>
			<SidebarUser user={user} onSignout={onSignout} />
		</SidebarProvider>,
	)
}

describe('SidebarUser', () => {
	beforeEach(() => {
		vi.mocked(useIsMobile).mockReturnValue(false)
	})

	it('renders the user name', () => {
		renderSidebarUser()
		expect(screen.getByText('Jane Doe')).toBeInTheDocument()
	})

	it('renders the user email', () => {
		renderSidebarUser()
		expect(screen.getByText('jane@example.com')).toBeInTheDocument()
	})

	it('renders the user avatar fallback initials', () => {
		renderSidebarUser()
		expect(screen.getByText('JD')).toBeInTheDocument()
	})

	it('renders the trigger as a menu button', () => {
		renderSidebarUser()
		const trigger = screen.getByText('Jane Doe').closest('button')
		expect(trigger).toHaveAttribute('aria-haspopup', 'menu')
	})

	it('does not show the dropdown content before opening', () => {
		renderSidebarUser()
		expect(screen.queryByRole('menu')).not.toBeInTheDocument()
	})

	it('opens the dropdown menu when the trigger is clicked', async () => {
		const userSession = userEvent.setup()
		renderSidebarUser()

		const trigger = screen.getByText('Jane Doe').closest('button')!
		await userSession.click(trigger)

		expect(screen.getByRole('menu')).toBeInTheDocument()
	})

	it('renders disabled Account and Notifications items', async () => {
		const userSession = userEvent.setup()
		renderSidebarUser()

		await userSession.click(screen.getByText('Jane Doe').closest('button')!)

		expect(screen.getByText('Account').closest('[role="menuitem"]')).toHaveAttribute('aria-disabled', 'true')
		expect(screen.getByText('Notifications').closest('[role="menuitem"]')).toHaveAttribute('aria-disabled', 'true')
	})

	it('renders a translated sign-out item', async () => {
		const userSession = userEvent.setup()
		renderSidebarUser()

		await userSession.click(screen.getByText('Jane Doe').closest('button')!)

		expect(screen.getByText('sign-out')).toBeInTheDocument()
	})

	it('calls onSignout when the sign-out item is clicked', async () => {
		const userSession = userEvent.setup()
		const onSignout = vi.fn()
		renderSidebarUser(onSignout)

		await userSession.click(screen.getByText('Jane Doe').closest('button')!)
		await userSession.click(screen.getByText('sign-out'))

		expect(onSignout).toHaveBeenCalledTimes(1)
	})

	it('does not call onSignout when a disabled item is clicked', async () => {
		const userSession = userEvent.setup()
		const onSignout = vi.fn()
		renderSidebarUser(onSignout)

		await userSession.click(screen.getByText('Jane Doe').closest('button')!)
		await userSession.click(screen.getByText('Account'))

		expect(onSignout).not.toHaveBeenCalled()
	})
})
