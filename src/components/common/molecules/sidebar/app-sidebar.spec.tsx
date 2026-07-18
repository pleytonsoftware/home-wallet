import type { Session } from 'next-auth'

import { UserGenderType } from '@/types/auth'

import { useSession } from 'next-auth/react'

import { SidebarProvider } from '@atoms/sidebar'
import { TooltipProvider } from '@atoms/tooltip'
import { useSignOut } from '@auth/hooks/use-signout.hook'
import { useIsMobile } from '@hooks/use-mobile'
import { UserRole } from '@lib/constants/role.enum'
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

function renderAppSidebar(householdName = 'My Household') {
	return render(
		<TooltipProvider>
			<SidebarProvider>
				<AppSidebar householdName={householdName} />
			</SidebarProvider>
		</TooltipProvider>,
	)
}

describe('AppSidebar', () => {
	beforeEach(() => {
		vi.mocked(useIsMobile).mockReturnValue(false)
		vi.mocked(useSignOut).mockReturnValue(vi.fn())
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
			renderAppSidebar('The Does')
			expect(screen.getByText('The Does')).toBeInTheDocument()
		})

		it('renders the Member nav item', () => {
			renderAppSidebar()
			expect(screen.getByText('Member')).toBeInTheDocument()
		})

		it('renders the Settings nav item with its nested routes once expanded', async () => {
			const user = userEvent.setup()
			renderAppSidebar()

			expect(screen.getByText('Settings')).toBeInTheDocument()
			await user.click(screen.getByText('Settings'))

			expect(screen.getByText('General')).toBeInTheDocument()
			expect(screen.getByText('Roles')).toBeInTheDocument()
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
