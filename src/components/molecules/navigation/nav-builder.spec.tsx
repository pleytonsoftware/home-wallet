import type { NavConfig } from './types'

import { useIsMobile } from '@/hooks/use-mobile'

import { SidebarProvider } from '@atoms/sidebar'
import { render, screen } from '@testing-library/react'

import { NavBuilder } from './nav-builder'

vi.mock('@/hooks/use-mobile', () => ({
	useIsMobile: vi.fn(() => false),
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
})
