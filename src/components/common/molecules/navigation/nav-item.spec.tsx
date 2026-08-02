import type { LucideIcon } from 'lucide-react'
import type { NavItem } from './types'

import { SidebarProvider } from '@atoms/sidebar'
import { useIsMobile } from '@hooks/use-mobile'
import { MemberRole } from '@lib/constants/role.enum'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { NavItemRenderer } from './nav-item'

vi.mock('@hooks/use-mobile', () => ({
	useIsMobile: vi.fn(() => false),
}))

const { currentRole } = vi.hoisted(() => ({ currentRole: { value: 'ADMIN' as MemberRole } }))

vi.mock('@households/context/household.context', () => ({
	useHouseholdContext: () => ({ household: { role: currentRole.value } }),
}))

vi.mock('@navigation', () => ({
	Link: (props: React.ComponentProps<'a'>) => <a {...props} />,
}))

const MockIcon = ((props: React.ComponentProps<'svg'>) => <svg data-testid='icon' {...props} />) as unknown as LucideIcon

const ActionIcon = ((props: React.ComponentProps<'svg'>) => <svg data-testid='action-icon' {...props} />) as unknown as LucideIcon

function makeItem(overrides: Partial<NavItem> = {}): NavItem {
	return {
		title: 'Dashboard',
		url: '/dashboard',
		...overrides,
	}
}

function renderItem(item: NavItem) {
	return render(
		<SidebarProvider>
			<NavItemRenderer item={item} />
		</SidebarProvider>,
	)
}

describe('NavItemRenderer', () => {
	beforeEach(() => {
		vi.mocked(useIsMobile).mockReturnValue(false)
		currentRole.value = MemberRole.ADMIN
	})

	describe('leaf item', () => {
		it('renders the title', () => {
			renderItem(makeItem())
			expect(screen.getByText('Dashboard')).toBeInTheDocument()
		})

		it('renders the icon when provided', () => {
			renderItem(makeItem({ icon: MockIcon }))
			expect(screen.getByTestId('icon')).toBeInTheDocument()
		})

		it('does not render an icon when omitted', () => {
			renderItem(makeItem())
			expect(screen.queryByTestId('icon')).not.toBeInTheDocument()
		})

		it('renders a relative url via next/link as an <a> tag', () => {
			renderItem(makeItem({ url: '/dashboard' }))
			const link = screen.getByRole('link', { name: 'Dashboard' })
			expect(link).toHaveAttribute('href', '/dashboard')
		})

		it('renders an absolute url as a plain anchor', () => {
			renderItem(makeItem({ url: 'https://example.com' }))
			const link = screen.getByRole('link', { name: 'Dashboard' })
			expect(link).toHaveAttribute('href', 'https://example.com')
		})

		it('renders a protocol-relative url as a plain anchor', () => {
			renderItem(makeItem({ url: '//example.com' }))
			const link = screen.getByRole('link', { name: 'Dashboard' })
			expect(link).toHaveAttribute('href', '//example.com')
		})

		it('renders without a link when url is omitted', () => {
			renderItem(makeItem({ url: undefined }))
			expect(screen.queryByRole('link')).not.toBeInTheDocument()
			expect(screen.getByText('Dashboard')).toBeInTheDocument()
		})

		it('marks the button active when isActive is true', () => {
			renderItem(makeItem({ isActive: true }))
			expect(screen.getByRole('link', { name: 'Dashboard' }).closest('[data-slot="sidebar-menu-button"]')).toHaveAttribute(
				'data-active',
				'true',
			)
		})

		it('applies the given size', () => {
			renderItem(makeItem({ size: 'lg' }))
			expect(screen.getByRole('link', { name: 'Dashboard' }).closest('[data-slot="sidebar-menu-button"]')).toHaveAttribute('data-size', 'lg')
		})

		it('renders a badge when provided', () => {
			renderItem(makeItem({ badge: '5' }))
			expect(screen.getByText('5')).toBeInTheDocument()
		})

		it('does not render a badge when omitted', () => {
			const { container } = renderItem(makeItem())
			expect(container.querySelector('[data-slot="sidebar-menu-badge"]')).not.toBeInTheDocument()
		})

		it('renders a badge with the value 0', () => {
			renderItem(makeItem({ badge: 0 }))
			expect(screen.getByText('0')).toBeInTheDocument()
		})

		it('renders an action button and calls its onClick handler', async () => {
			const user = userEvent.setup()
			const onClick = vi.fn()
			renderItem(makeItem({ action: { icon: ActionIcon, onClick } }))

			const actionButton = screen.getByTestId('action-icon').closest('[data-slot="sidebar-menu-action"]') as HTMLElement
			expect(actionButton).toBeInTheDocument()

			await user.click(actionButton)
			expect(onClick).toHaveBeenCalledTimes(1)
		})

		it('renders the action srLabel as sr-only text', () => {
			renderItem(makeItem({ action: { icon: ActionIcon, srLabel: 'Remove item' } }))
			expect(screen.getByText('Remove item')).toBeInTheDocument()
		})

		it('does not render an action button when omitted', () => {
			const { container } = renderItem(makeItem())
			expect(container.querySelector('[data-slot="sidebar-menu-action"]')).not.toBeInTheDocument()
		})
	})

	describe('collapsible item with sub-items', () => {
		function makeParent(overrides: Partial<NavItem> = {}): NavItem {
			return makeItem({
				items: [
					{ title: 'Child A', url: '/child-a' },
					{ title: 'Child B', url: '/child-b' },
				],
				...overrides,
			})
		}

		it('renders the trigger title', () => {
			renderItem(makeParent())
			expect(screen.getByText('Dashboard')).toBeInTheDocument()
		})

		it('renders every sub-item once expanded', () => {
			renderItem(makeParent({ defaultOpen: true }))
			expect(screen.getByText('Child A')).toBeInTheDocument()
			expect(screen.getByText('Child B')).toBeInTheDocument()
		})

		it('does not render a top-level link for the parent', () => {
			renderItem(makeParent())
			expect(screen.queryByRole('link', { name: 'Dashboard' })).not.toBeInTheDocument()
		})

		it('defaults open state to isActive when defaultOpen is not set', () => {
			const { container } = renderItem(makeParent({ isActive: true }))
			expect(container.querySelector('[data-slot="collapsible"]')).toHaveAttribute('data-state', 'open')
		})

		it('closes by default when isActive is false and defaultOpen is unset', () => {
			const { container } = renderItem(makeParent({ isActive: false }))
			expect(container.querySelector('[data-slot="collapsible"]')).toHaveAttribute('data-state', 'closed')
		})

		it('honors an explicit defaultOpen over isActive', () => {
			const { container } = renderItem(makeParent({ isActive: false, defaultOpen: true }))
			expect(container.querySelector('[data-slot="collapsible"]')).toHaveAttribute('data-state', 'open')
		})

		it('toggles sub-menu visibility when the trigger is clicked', async () => {
			const user = userEvent.setup()
			const { container } = renderItem(makeParent())

			expect(container.querySelector('[data-slot="collapsible"]')).toHaveAttribute('data-state', 'closed')
			await user.click(screen.getByText('Dashboard'))
			expect(container.querySelector('[data-slot="collapsible"]')).toHaveAttribute('data-state', 'open')
		})

		describe('role-based sub-item visibility', () => {
			function makeGatedParent(): NavItem {
				return makeItem({
					defaultOpen: true,
					items: [
						{ title: 'Everyone', url: '/everyone' },
						{ title: 'Admins only', url: '/admins', allowedRoles: [MemberRole.ADMIN] },
					],
				})
			}

			it('renders admin-gated sub-items for an admin', () => {
				currentRole.value = MemberRole.ADMIN
				renderItem(makeGatedParent())
				expect(screen.getByText('Everyone')).toBeInTheDocument()
				expect(screen.getByText('Admins only')).toBeInTheDocument()
			})

			it('hides admin-gated sub-items from a member', () => {
				currentRole.value = MemberRole.MEMBER
				renderItem(makeGatedParent())
				expect(screen.getByText('Everyone')).toBeInTheDocument()
				expect(screen.queryByText('Admins only')).not.toBeInTheDocument()
			})
		})
	})
})
