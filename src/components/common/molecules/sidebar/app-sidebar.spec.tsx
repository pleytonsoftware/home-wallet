import type { Session } from 'next-auth'

import { UserGenderType } from '@/types/auth'

import { useSession } from 'next-auth/react'

import { SidebarProvider } from '@atoms/sidebar'
import { TooltipProvider } from '@atoms/tooltip'
import { useSignOut } from '@auth/hooks/use-signout.hook'
import { useIsMobile } from '@hooks/use-mobile'
import { MemberRole, UserRole } from '@lib/constants/role.enum'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { AppSidebar } from './app-sidebar'

vi.mock('@hooks/use-mobile', () => ({
	useIsMobile: vi.fn(() => false),
}))

vi.mock('next-intl', () => ({
	useTranslations: () => (key: string) => key,
}))

vi.mock('next-auth/react', () => ({
	useSession: vi.fn(),
}))

vi.mock('@auth/hooks/use-signout.hook', () => ({
	useSignOut: vi.fn(),
}))

const { currentHousehold, currentPathname } = vi.hoisted(() => ({
	currentHousehold: { value: { id: 'household-id', name: 'My Household', role: 'ADMIN' as MemberRole } },
	currentPathname: { value: '/' },
}))

vi.mock('@households/context/household.context', () => ({
	useHouseholdContext: () => ({ household: currentHousehold.value }),
}))

vi.mock('@navigation', () => ({
	usePathname: () => currentPathname.value,
	Link: (props: React.ComponentProps<'a'>) => <a {...props} />,
}))

const sessionUser = {
	name: 'Jane Doe',
	email: 'jane@example.com',
	image: null,
	createdAt: new Date('2023-01-01T00:00:00.000Z'),
	emailVerified: new Date('2023-01-01T00:00:00.000Z'),
	gender: UserGenderType.female,
	role: UserRole.MEMBER,
	id: 'user-id',
	householdIds: ['household-id'],
} satisfies Session['user']

function renderAppSidebar() {
	return render(
		<TooltipProvider>
			<SidebarProvider>
				<AppSidebar />
			</SidebarProvider>
		</TooltipProvider>,
	)
}

describe('AppSidebar', () => {
	beforeEach(() => {
		vi.mocked(useIsMobile).mockReturnValue(false)
		vi.mocked(useSignOut).mockReturnValue(vi.fn())
		currentHousehold.value = { id: 'household-id', name: 'My Household', role: MemberRole.ADMIN }
		currentPathname.value = '/'
	})

	it('throws when there is no active session', () => {
		vi.mocked(useSession).mockReturnValue({ data: null, status: 'unauthenticated', update: vi.fn() })
		const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

		expect(() => renderAppSidebar()).toThrow('Session is required to render the sidebar')

		consoleSpy.mockRestore()
	})

	describe('with an active session', () => {
		beforeEach(() => {
			vi.mocked(useSession).mockReturnValue({
				data: {
					user: sessionUser,
					expires: '2099-01-01',
					id: 'session-id',
					isAuthenticated: true,
					sessionToken: 'session-token',
					userId: sessionUser.id,
				},
				status: 'authenticated',
				update: vi.fn(),
			})
		})

		it('renders the sidebar brand', () => {
			const { container } = renderAppSidebar()
			expect(container.querySelector('[data-slot="sidebar-header"]')).toBeInTheDocument()
		})

		it('renders the household name as the nav group label', () => {
			currentHousehold.value = { ...currentHousehold.value, name: 'The Does' }
			renderAppSidebar()
			expect(screen.getByText('The Does')).toBeInTheDocument()
		})

		it('renders the Transactions nav item with its nested routes once expanded', async () => {
			const user = userEvent.setup()
			renderAppSidebar()

			expect(screen.getByText('sidebar.transactions.$')).toBeInTheDocument()
			await user.click(screen.getByText('sidebar.transactions.$'))

			expect(screen.getByText('sidebar.transactions.recurring')).toBeInTheDocument()
		})

		it('renders the Budgets nav item with its nested routes once expanded', async () => {
			const user = userEvent.setup()
			renderAppSidebar()

			expect(screen.getByText('sidebar.budgets.$')).toBeInTheDocument()
			await user.click(screen.getByText('sidebar.budgets.$'))

			expect(screen.getByText('sidebar.budgets.personal')).toBeInTheDocument()
			expect(screen.getByText('sidebar.budgets.shared')).toBeInTheDocument()
		})

		it('renders the Settings nav item with its nested routes once expanded for an admin', async () => {
			const user = userEvent.setup()
			currentHousehold.value = { ...currentHousehold.value, role: MemberRole.ADMIN }
			renderAppSidebar()

			expect(screen.getByText('sidebar.settings')).toBeInTheDocument()
			await user.click(screen.getByText('sidebar.settings'))

			expect(screen.getByText('sections.general')).toBeInTheDocument()
			expect(screen.getByText('sections.members')).toBeInTheDocument()
			expect(screen.getByText('sections.danger')).toBeInTheDocument()
		})

		it('also shows the Members settings route to a non-admin member — it self-gates its admin-only content', async () => {
			const user = userEvent.setup()
			currentHousehold.value = { ...currentHousehold.value, role: MemberRole.MEMBER }
			renderAppSidebar()

			await user.click(screen.getByText('sidebar.settings'))

			expect(screen.getByText('sections.general')).toBeInTheDocument()
			expect(screen.getByText('sections.danger')).toBeInTheDocument()
			expect(screen.getByText('sections.members')).toBeInTheDocument()
		})

		it('keeps Settings expanded and marks the active sub-route based on the current url', () => {
			currentPathname.value = `/household/${currentHousehold.value.id}/settings/general`
			renderAppSidebar()

			// Settings auto-expands because a child route is active — no click required.
			const settingsCollapsible = screen.getByText('sidebar.settings').closest('[data-slot="collapsible"]')
			expect(settingsCollapsible).toHaveAttribute('data-state', 'open')

			const general = screen.getByRole('link', { name: 'sections.general' }).closest('[data-slot="sidebar-menu-sub-button"]')
			expect(general).toHaveAttribute('data-active', 'true')
		})

		it('renders the signed-in user in the footer', () => {
			renderAppSidebar()
			expect(screen.getByText('Jane Doe')).toBeInTheDocument()
			expect(screen.getByText('jane@example.com')).toBeInTheDocument()
		})

		it('wires up sign out via useSignOut', async () => {
			const handleSignOut = vi.fn()
			vi.mocked(useSignOut).mockReturnValue(handleSignOut)
			const user = userEvent.setup()

			renderAppSidebar()

			await user.click(screen.getByText('Jane Doe').closest('button')!)
			await user.click(screen.getByText('sign-out'))

			expect(handleSignOut).toHaveBeenCalledTimes(1)
		})
	})
})
