import type { HouseholdMemberWithRole } from '@households/types'

import { MemberRole } from '@lib/constants/role.enum'
import { render, screen } from '@testing-library/react'

import { MemberItem } from './member-item'

vi.mock('next-intl', () => ({
	useTranslations: () => (key: string) => key,
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
	it('renders the member name and email', () => {
		render(<MemberItem member={MEMBER} isCurrentUser={false} />)
		expect(screen.getByText('Alice Smith')).toBeInTheDocument()
		expect(screen.getByText('alice@example.com')).toBeInTheDocument()
	})

	it('renders avatar fallback initials from the member name', () => {
		render(<MemberItem member={MEMBER} isCurrentUser={false} />)
		expect(screen.getByText('AS')).toBeInTheDocument()
	})

	it('does not show a "you" indicator when not the current user', () => {
		render(<MemberItem member={MEMBER} isCurrentUser={false} />)
		expect(screen.queryByText(/you/i)).not.toBeInTheDocument()
	})

	it('shows a "you" indicator when it is the current user', () => {
		render(<MemberItem member={MEMBER} isCurrentUser />)
		expect(screen.getByText(/you/i)).toBeInTheDocument()
	})
})
