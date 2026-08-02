import type { LucideIcon } from 'lucide-react'
import type { NavGroup } from './types'

import { SidebarProvider } from '@atoms/sidebar'
import { useIsMobile } from '@hooks/use-mobile'
import { MemberRole } from '@lib/constants/role.enum'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { NavGroupRenderer } from './nav-group'

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

const GroupActionIcon = ((props: React.ComponentProps<'svg'>) => <svg data-testid='group-action-icon' {...props} />) as unknown as LucideIcon

function makeGroup(overrides: Partial<NavGroup> = {}): NavGroup {
	return {
		label: 'Section',
		items: [{ title: 'Item one', url: '/one' }],
		...overrides,
	}
}

function renderGroup(group: NavGroup) {
	return render(
		<SidebarProvider>
			<NavGroupRenderer group={group} />
		</SidebarProvider>,
	)
}

describe('NavGroupRenderer', () => {
	beforeEach(() => {
		vi.mocked(useIsMobile).mockReturnValue(false)
		currentRole.value = MemberRole.ADMIN
	})

	describe('static group', () => {
		it('renders the label', () => {
			renderGroup(makeGroup())
			expect(screen.getByText('Section')).toBeInTheDocument()
		})

		it('does not render a label when omitted', () => {
			const { container } = renderGroup(makeGroup({ label: undefined }))
			expect(container.querySelector('[data-slot="sidebar-group-label"]')).not.toBeInTheDocument()
		})

		it('renders every item', () => {
			renderGroup(
				makeGroup({
					items: [
						{ title: 'Item one', url: '/one' },
						{ title: 'Item two', url: '/two' },
					],
				}),
			)
			expect(screen.getByText('Item one')).toBeInTheDocument()
			expect(screen.getByText('Item two')).toBeInTheDocument()
		})

		it('renders items inside a SidebarMenu', () => {
			const { container } = renderGroup(makeGroup())
			expect(container.querySelector('[data-slot="sidebar-menu"]')).toBeInTheDocument()
		})

		it('does not wrap in a Collapsible by default', () => {
			const { container } = renderGroup(makeGroup())
			expect(container.querySelector('[data-slot="collapsible"]')).not.toBeInTheDocument()
		})

		it('renders a group action and calls its onClick handler', async () => {
			const user = userEvent.setup()
			const onClick = vi.fn()
			renderGroup(makeGroup({ groupAction: { icon: GroupActionIcon, onClick } }))

			const action = screen.getByTestId('group-action-icon').closest('[data-slot="sidebar-group-action"]') as HTMLElement
			expect(action).toBeInTheDocument()

			await user.click(action)
			expect(onClick).toHaveBeenCalledTimes(1)
		})

		it('renders the group action srLabel as sr-only text', () => {
			renderGroup(makeGroup({ groupAction: { icon: GroupActionIcon, srLabel: 'Add item' } }))
			expect(screen.getByText('Add item')).toBeInTheDocument()
		})

		it('does not render a group action when omitted', () => {
			const { container } = renderGroup(makeGroup())
			expect(container.querySelector('[data-slot="sidebar-group-action"]')).not.toBeInTheDocument()
		})
	})

	describe('collapsible group', () => {
		it('wraps the group in a Collapsible', () => {
			const { container } = renderGroup(makeGroup({ collapsible: true }))
			expect(container.querySelector('[data-slot="collapsible"]')).toBeInTheDocument()
		})

		it('defaults to closed', () => {
			const { container } = renderGroup(makeGroup({ collapsible: true }))
			expect(container.querySelector('[data-slot="collapsible"]')).toHaveAttribute('data-state', 'closed')
		})

		it('honors defaultOpen', () => {
			const { container } = renderGroup(makeGroup({ collapsible: true, defaultOpen: true }))
			expect(container.querySelector('[data-slot="collapsible"]')).toHaveAttribute('data-state', 'open')
		})

		it('uses the label as the collapse trigger', () => {
			renderGroup(makeGroup({ collapsible: true }))
			expect(screen.getByRole('button', { name: /Section/ })).toBeInTheDocument()
		})

		it('toggles open state when the label is clicked', async () => {
			const user = userEvent.setup()
			const { container } = renderGroup(makeGroup({ collapsible: true }))

			expect(container.querySelector('[data-slot="collapsible"]')).toHaveAttribute('data-state', 'closed')
			await user.click(screen.getByText('Section'))
			expect(container.querySelector('[data-slot="collapsible"]')).toHaveAttribute('data-state', 'open')
		})

		it('renders items once expanded', () => {
			renderGroup(makeGroup({ collapsible: true, defaultOpen: true }))
			expect(screen.getByText('Item one')).toBeInTheDocument()
		})

		it('does not render a trigger when label is omitted', () => {
			const { container } = renderGroup(makeGroup({ collapsible: true, label: undefined }))
			expect(container.querySelector('[data-slot="sidebar-group-label"]')).not.toBeInTheDocument()
		})

		it('renders a group action alongside the collapsible label', async () => {
			const user = userEvent.setup()
			const onClick = vi.fn()
			renderGroup(makeGroup({ collapsible: true, groupAction: { icon: GroupActionIcon, onClick } }))

			const action = screen.getByTestId('group-action-icon').closest('[data-slot="sidebar-group-action"]') as HTMLElement
			await user.click(action)
			expect(onClick).toHaveBeenCalledTimes(1)
		})
	})

	describe('role-based item visibility', () => {
		function makeGatedGroup(): NavGroup {
			return makeGroup({
				items: [
					{ title: 'Everyone', url: '/everyone' },
					{ title: 'Admins only', url: '/admins', allowedRoles: [MemberRole.ADMIN] },
				],
			})
		}

		it('renders admin-gated items for an admin', () => {
			currentRole.value = MemberRole.ADMIN
			renderGroup(makeGatedGroup())
			expect(screen.getByText('Everyone')).toBeInTheDocument()
			expect(screen.getByText('Admins only')).toBeInTheDocument()
		})

		it('hides admin-gated items from a member', () => {
			currentRole.value = MemberRole.MEMBER
			renderGroup(makeGatedGroup())
			expect(screen.getByText('Everyone')).toBeInTheDocument()
			expect(screen.queryByText('Admins only')).not.toBeInTheDocument()
		})
	})
})
