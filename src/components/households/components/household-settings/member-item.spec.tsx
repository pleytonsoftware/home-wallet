import type { HouseholdMemberWithRole } from '@households/types'

import { MemberRole } from '@lib/constants/role.enum'
import { render, screen } from '@testing-library/react'

import { MemberItem } from './member-item'

const isAdminMock = { value: true }
const currentUserMock = { value: { id: 'someone-else' } }

vi.mock('next-intl', () => ({
	useTranslations: () => (key: string) => key,
}))

vi.mock('@households/context/household.context', () => ({
	useHouseholdContext: () => ({ isAdmin: isAdminMock.value }),
}))

vi.mock('@/hooks/use-current-user', () => ({
	useCurrentUser: () => ({ user: currentUserMock.value }),
}))

const MEMBER: HouseholdMemberWithRole = {
	id: 'u1',
	memberId: 'm1',
	name: 'Alice Smith',
	email: 'alice@example.com',
	image: null,
	role: MemberRole.ADMIN,
}

describe('MemberItem', () => {
	beforeEach(() => {
		isAdminMock.value = true
		currentUserMock.value = { id: 'someone-else' }
	})

	it('renders the member name', () => {
		render(<MemberItem member={MEMBER} />)
		expect(screen.getByText('Alice Smith')).toBeInTheDocument()
	})

	it('renders avatar fallback initials from the member name', () => {
		render(<MemberItem member={MEMBER} />)
		expect(screen.getByText('AS')).toBeInTheDocument()
	})

	it('shows the email to an admin viewer', () => {
		render(<MemberItem member={MEMBER} />)
		expect(screen.getByText('alice@example.com')).toBeInTheDocument()
	})

	it('hides the email from a non-admin viewer', () => {
		isAdminMock.value = false
		render(<MemberItem member={MEMBER} />)
		expect(screen.queryByText('alice@example.com')).not.toBeInTheDocument()
	})

	it('does not show a "you" indicator when not the current user', () => {
		render(<MemberItem member={MEMBER} />)
		expect(screen.queryByText(/you/i)).not.toBeInTheDocument()
	})

	it('shows a "you" indicator when it is the current user', () => {
		currentUserMock.value = { id: MEMBER.id }
		render(<MemberItem member={MEMBER} />)
		expect(screen.getByText(/you/i)).toBeInTheDocument()
	})

	it('renders extraNode content when given', () => {
		render(<MemberItem member={MEMBER} extraNode='Removed on Jan 1' />)
		expect(screen.getByText('Removed on Jan 1')).toBeInTheDocument()
	})
})
