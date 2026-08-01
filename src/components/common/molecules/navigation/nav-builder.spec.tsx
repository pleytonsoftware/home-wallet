import type { NavConfig } from './types'

import { SidebarProvider } from '@atoms/sidebar'
import { useIsMobile } from '@hooks/use-mobile'
import { render, screen } from '@testing-library/react'

import { NavBuilder } from './nav-builder'

vi.mock('@hooks/use-mobile', () => ({
	useIsMobile: vi.fn(() => false),
}))

vi.mock('@households/context/household.context', () => ({
	useHouseholdContext: () => ({ household: { role: 'ADMIN' } }),
}))

const { currentPathname } = vi.hoisted(() => ({ currentPathname: { value: '/' } }))

vi.mock('@navigation', () => ({
	usePathname: () => currentPathname.value,
	Link: (props: React.ComponentProps<'a'>) => <a {...props} />,
}))

function renderConfig(config: NavConfig) {
	return render(
		<SidebarProvider>
			<NavBuilder config={config} />
		</SidebarProvider>,
	)
}

describe('NavBuilder', () => {
	beforeEach(() => {
		vi.mocked(useIsMobile).mockReturnValue(false)
		currentPathname.value = '/'
	})

	it('renders nothing for an empty config', () => {
		const { container } = renderConfig([])
		expect(container.querySelectorAll('[data-slot="sidebar-group"]')).toHaveLength(0)
	})

	it('renders a single group', () => {
		renderConfig([{ label: 'Group A', items: [{ title: 'Item A', url: '/a' }] }])
		expect(screen.getByText('Group A')).toBeInTheDocument()
		expect(screen.getByText('Item A')).toBeInTheDocument()
	})

	it('renders multiple groups in order', () => {
		const { container } = renderConfig([
			{ label: 'Group A', items: [{ title: 'Item A', url: '/a' }] },
			{ label: 'Group B', items: [{ title: 'Item B', url: '/b' }] },
		])

		const labels = Array.from(container.querySelectorAll('[data-slot="sidebar-group-label"]')).map((el) => el.textContent)
		expect(labels).toEqual(['Group A', 'Group B'])
	})

	it('renders every group as a SidebarGroup', () => {
		const { container } = renderConfig([
			{ label: 'Group A', items: [{ title: 'Item A', url: '/a' }] },
			{ label: 'Group B', items: [{ title: 'Item B', url: '/b' }] },
		])
		expect(container.querySelectorAll('[data-slot="sidebar-group"]')).toHaveLength(2)
	})

	it('propagates nested items and sub-items through the full tree', () => {
		renderConfig([
			{
				label: 'Group A',
				items: [
					{
						title: 'Parent item',
						items: [{ title: 'Nested item', url: '/nested' }],
						defaultOpen: true,
					},
				],
			},
		])

		expect(screen.getByText('Group A')).toBeInTheDocument()
		expect(screen.getByText('Parent item')).toBeInTheDocument()
		expect(screen.getByText('Nested item')).toBeInTheDocument()
	})

	it('falls back to index as key for groups without a label', () => {
		expect(() => renderConfig([{ items: [{ title: 'Item A', url: '/a' }] }, { items: [{ title: 'Item B', url: '/b' }] }])).not.toThrow()
		expect(screen.getByText('Item A')).toBeInTheDocument()
		expect(screen.getByText('Item B')).toBeInTheDocument()
	})

	describe('url-driven active state', () => {
		const settingsConfig: NavConfig = [
			{
				label: 'Household',
				items: [
					{
						title: 'Settings',
						items: [
							{ title: 'General', url: '/settings/general' },
							{ title: 'Members', url: '/settings/members' },
						],
					},
				],
			},
		]

		it('keeps the parent open and shows the matching sub-item as active for the current url', () => {
			currentPathname.value = '/settings/general'
			const { container } = renderConfig(settingsConfig)

			expect(container.querySelector('[data-slot="collapsible"]')).toHaveAttribute('data-state', 'open')

			const general = screen.getByRole('link', { name: 'General' }).closest('[data-slot="sidebar-menu-sub-button"]')
			const members = screen.getByRole('link', { name: 'Members' }).closest('[data-slot="sidebar-menu-sub-button"]')
			expect(general).toHaveAttribute('data-active', 'true')
			expect(members).not.toHaveAttribute('data-active', 'true')
		})

		it('keeps the parent collapsed when the url matches no sub-item', () => {
			currentPathname.value = '/dashboard'
			const { container } = renderConfig(settingsConfig)

			expect(container.querySelector('[data-slot="collapsible"]')).toHaveAttribute('data-state', 'closed')
		})
	})
})
