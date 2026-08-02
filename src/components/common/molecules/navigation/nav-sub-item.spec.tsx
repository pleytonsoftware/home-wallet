import type { LucideIcon } from 'lucide-react'
import type { NavSubItem } from './types'

import { render, screen } from '@testing-library/react'

import { NavSubItemRenderer } from './nav-sub-item'

vi.mock('@navigation', () => ({
	Link: (props: React.ComponentProps<'a'>) => <a {...props} />,
}))

const MockIcon = ((props: React.ComponentProps<'svg'>) => <svg data-testid='icon' {...props} />) as unknown as LucideIcon

function makeItem(overrides: Partial<NavSubItem> = {}): NavSubItem {
	return {
		title: 'Sub item',
		url: '/sub-item',
		...overrides,
	}
}

describe('NavSubItemRenderer', () => {
	it('renders the title', () => {
		render(<NavSubItemRenderer item={makeItem()} />)
		expect(screen.getByText('Sub item')).toBeInTheDocument()
	})

	it('renders a link with the given url', () => {
		render(<NavSubItemRenderer item={makeItem({ url: '/foo' })} />)
		expect(screen.getByRole('link', { name: 'Sub item' })).toHaveAttribute('href', '/foo')
	})

	it('renders the icon when provided', () => {
		render(<NavSubItemRenderer item={makeItem({ icon: MockIcon })} />)
		expect(screen.getByTestId('icon')).toBeInTheDocument()
	})

	it('does not render an icon when omitted', () => {
		render(<NavSubItemRenderer item={makeItem()} />)
		expect(screen.queryByTestId('icon')).not.toBeInTheDocument()
	})

	it('marks the button as active when isActive is true', () => {
		render(<NavSubItemRenderer item={makeItem({ isActive: true })} />)
		expect(screen.getByRole('link', { name: 'Sub item' })).toHaveAttribute('data-active', 'true')
	})

	it('marks the button as inactive by default', () => {
		render(<NavSubItemRenderer item={makeItem()} />)
		expect(screen.getByRole('link', { name: 'Sub item' })).toHaveAttribute('data-active', 'false')
	})

	it('defaults size to md', () => {
		render(<NavSubItemRenderer item={makeItem()} />)
		expect(screen.getByRole('link', { name: 'Sub item' })).toHaveAttribute('data-size', 'md')
	})

	it('honors a custom size', () => {
		render(<NavSubItemRenderer item={makeItem({ size: 'sm' })} />)
		expect(screen.getByRole('link', { name: 'Sub item' })).toHaveAttribute('data-size', 'sm')
	})

	it('renders inside a SidebarMenuSubItem', () => {
		const { container } = render(<NavSubItemRenderer item={makeItem()} />)
		expect(container.querySelector('[data-slot="sidebar-menu-sub-item"]')).toBeInTheDocument()
	})
})
