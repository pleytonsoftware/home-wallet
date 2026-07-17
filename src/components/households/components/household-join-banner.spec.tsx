import { render, screen } from '@testing-library/react'

import { HouseholdJoinBanner } from './household-join-banner'

vi.mock('@households/components/household-join/household-join-drawer', () => ({
	HouseholdJoinDrawer: ({ trigger }: { trigger: React.ReactNode }) => <div data-testid='household-join-drawer'>{trigger}</div>,
}))

describe('HouseholdJoinBanner', () => {
	it('renders the title and description', () => {
		render(<HouseholdJoinBanner title='Join a household' description='Use an invite code' cta='Join now' />)

		expect(screen.getByText('Join a household')).toBeInTheDocument()
		expect(screen.getByText('Use an invite code')).toBeInTheDocument()
	})

	it('renders the join drawer trigger with the cta text', () => {
		render(<HouseholdJoinBanner title='Join a household' description='Use an invite code' cta='Join now' />)

		expect(screen.getByRole('button', { name: 'Join now' })).toBeInTheDocument()
	})
})
