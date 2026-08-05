import type { HouseholdMemberWithRole } from '@households/types'

import { MemberRole } from '@lib/constants/role.enum'
import { render, screen } from '@testing-library/react'

import { MembersList } from './members-list'

const householdMock = { value: { id: 'h1', members: [] as HouseholdMemberWithRole[] } }
const currentUserMock = { value: { id: 'u1' } }
const isAdminMock = { value: false }

vi.mock('next-intl', () => ({
	useTranslations: () => (key: string) => key,
}))

vi.mock('@households/context/household.context', () => ({
	useHouseholdContext: () => ({ household: householdMock.value, isAdmin: isAdminMock.value }),
}))

vi.mock('@hooks/use-current-user', () => ({
	useCurrentUser: () => ({ user: currentUserMock.value, isAuthenticated: true }),
}))

const MEMBERS: HouseholdMemberWithRole[] = [
	{ id: 'u1', memberId: 'm1', name: 'Alice', email: 'alice@example.com', image: null, role: MemberRole.ADMIN },
	{ id: 'u2', memberId: 'm2', name: 'Bob', email: 'bob@example.com', image: null, role: MemberRole.MEMBER },
]

describe('MembersList', () => {
	beforeEach(() => {
		householdMock.value = { id: 'h1', members: MEMBERS }
		currentUserMock.value = { id: 'u1' }
		isAdminMock.value = false
	})

	it('lists every member with their name', () => {
		render(<MembersList />)

		expect(screen.getByText('Alice')).toBeInTheDocument()
		expect(screen.getByText('Bob')).toBeInTheDocument()
	})

	it('hides emails from a non-admin viewer', () => {
		render(<MembersList />)

		expect(screen.queryByText('alice@example.com')).not.toBeInTheDocument()
		expect(screen.queryByText('bob@example.com')).not.toBeInTheDocument()
	})

	it('shows emails to an admin viewer', () => {
		isAdminMock.value = true
		render(<MembersList />)

		expect(screen.getByText('alice@example.com')).toBeInTheDocument()
		expect(screen.getByText('bob@example.com')).toBeInTheDocument()
	})

	it('marks the current session user with a "you" indicator', () => {
		render(<MembersList />)
		expect(screen.getByText(/you/i)).toBeInTheDocument()
	})

	it('shows an admin badge for admins and a member badge for members', () => {
		render(<MembersList />)

		expect(screen.getByText('admin')).toBeInTheDocument()
		expect(screen.getByText('member')).toBeInTheDocument()
	})

	it('does not render any action buttons — it is read-only for every role', () => {
		render(<MembersList />)
		expect(screen.queryByRole('button')).not.toBeInTheDocument()
	})

	it('caps the list height and scrolls instead of growing unbounded', () => {
		const { container } = render(<MembersList />)
		expect(container.querySelector('ul')).toHaveClass('max-h-72', 'overflow-y-auto')
	})
})
