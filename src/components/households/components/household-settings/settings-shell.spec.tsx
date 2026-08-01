import { ROUTES } from '@lib/constants/routes.const'
import { render, screen } from '@testing-library/react'

import { SettingsShell } from './settings-shell'

const { householdMock, isAdminMock, pathnameMock } = vi.hoisted(() => ({
	householdMock: { value: { id: 'h1' } },
	isAdminMock: { value: true },
	pathnameMock: { value: '/household/h1/settings/general' },
}))

vi.mock('next-intl', () => ({
	useTranslations: () => (key: string) => key,
}))

vi.mock('@households/context/household.context', () => ({
	useHouseholdContext: () => ({ household: householdMock.value, isAdmin: isAdminMock.value }),
}))

vi.mock('@navigation', () => ({
	Link: ({ children, prefetch: _prefetch, ...props }: React.ComponentProps<'a'> & { prefetch?: boolean }) => <a {...props}>{children}</a>,
	usePathname: () => pathnameMock.value,
}))

const hrefFor = (route: string) => route.replace(':id', 'h1')

describe('SettingsShell', () => {
	beforeEach(() => {
		householdMock.value = { id: 'h1' }
		isAdminMock.value = true
		pathnameMock.value = hrefFor(ROUTES.HOUSEHOLD.SETTINGS.GENERAL)
	})

	it('renders the header with title and subtitle', () => {
		render(<SettingsShell>content</SettingsShell>)
		expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('title')
		expect(screen.getByText('subtitle')).toBeInTheDocument()
	})

	it('renders the children', () => {
		render(<SettingsShell>child content</SettingsShell>)
		expect(screen.getByText('child content')).toBeInTheDocument()
	})

	it('renders a tab link for every section when admin', () => {
		render(<SettingsShell>content</SettingsShell>)
		expect(screen.getByRole('tab', { name: 'sections.general' })).toHaveAttribute('href', hrefFor(ROUTES.HOUSEHOLD.SETTINGS.GENERAL))
		expect(screen.getByRole('tab', { name: 'sections.members' })).toHaveAttribute('href', hrefFor(ROUTES.HOUSEHOLD.SETTINGS.MEMBERS))
		expect(screen.getByRole('tab', { name: 'sections.danger' })).toHaveAttribute('href', hrefFor(ROUTES.HOUSEHOLD.SETTINGS.DANGER))
	})

	it('hides admin-only sections for non-admins', () => {
		isAdminMock.value = false
		render(<SettingsShell>content</SettingsShell>)
		expect(screen.getByRole('tab', { name: 'sections.general' })).toBeInTheDocument()
		expect(screen.queryByRole('tab', { name: 'sections.members' })).not.toBeInTheDocument()
		expect(screen.getByRole('tab', { name: 'sections.danger' })).toBeInTheDocument()
	})

	it('marks the section matching the current pathname as active', () => {
		pathnameMock.value = hrefFor(ROUTES.HOUSEHOLD.SETTINGS.MEMBERS)
		render(<SettingsShell>content</SettingsShell>)
		expect(screen.getByRole('tab', { name: 'sections.members' })).toHaveAttribute('data-state', 'active')
		expect(screen.getByRole('tab', { name: 'sections.general' })).toHaveAttribute('data-state', 'inactive')
	})

	it('treats nested pathnames as active for their section', () => {
		pathnameMock.value = `${hrefFor(ROUTES.HOUSEHOLD.SETTINGS.DANGER)}/confirm`
		render(<SettingsShell>content</SettingsShell>)
		expect(screen.getByRole('tab', { name: 'sections.danger' })).toHaveAttribute('data-state', 'active')
	})

	it('leaves every section inactive when no route matches', () => {
		pathnameMock.value = '/household/h1/settings'
		render(<SettingsShell>content</SettingsShell>)
		expect(screen.getByRole('tab', { name: 'sections.general' })).toHaveAttribute('data-state', 'inactive')
		expect(screen.getByRole('tab', { name: 'sections.members' })).toHaveAttribute('data-state', 'inactive')
		expect(screen.getByRole('tab', { name: 'sections.danger' })).toHaveAttribute('data-state', 'inactive')
	})

	it('interpolates the household id into the section hrefs', () => {
		householdMock.value = { id: 'other-house' }
		pathnameMock.value = '/household/other-house/settings/general'
		render(<SettingsShell>content</SettingsShell>)
		expect(screen.getByRole('tab', { name: 'sections.general' })).toHaveAttribute('href', '/household/other-house/settings/general')
	})
})
