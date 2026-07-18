import { ROUTES } from '@lib/constants/routes.const'
import { render, screen } from '@testing-library/react'

import { SidebarBrand } from './sidebar-brand'

describe('SidebarBrand', () => {
	it('renders a link to the landing route', () => {
		render(<SidebarBrand />)
		expect(screen.getByRole('link')).toHaveAttribute('href', ROUTES.LANDING)
	})

	it('renders the header with a "Go to dashboard" title', () => {
		const { container } = render(<SidebarBrand />)
		expect(container.querySelector('[data-slot="sidebar-header"]')).toHaveAttribute('title', 'Go to dashboard')
	})

	it('renders the app name in a display-title span', () => {
		const { container } = render(<SidebarBrand />)
		const title = container.querySelector('.display-title')
		expect(title).toBeInTheDocument()
		expect(title).toHaveTextContent(process.env.NEXT_PUBLIC_APP_NAME ?? '')
	})

	it('renders the logo image', () => {
		render(<SidebarBrand />)
		expect(screen.getByRole('img')).toHaveAttribute('alt', `${process.env.NEXT_PUBLIC_APP_NAME} logo`)
	})

	it('renders inside a SidebarHeader', () => {
		const { container } = render(<SidebarBrand />)
		expect(container.querySelector('[data-slot="sidebar-header"]')).toBeInTheDocument()
	})
})
