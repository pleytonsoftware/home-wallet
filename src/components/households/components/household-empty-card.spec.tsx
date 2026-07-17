import { useSession } from 'next-auth/react'

import { render, screen } from '@testing-library/react'

import { HouseholdEmptyCard } from './household-empty-card'

vi.mock('next-auth/react', () => ({
	useSession: vi.fn(),
}))

vi.mock('@households/components/household-create', () => ({
	HouseholdCreate: ({ trigger }: { trigger: React.ReactNode }) => <div data-testid='household-create'>{trigger}</div>,
}))

describe('HouseholdEmptyCard', () => {
	it('renders the title and description', () => {
		vi.mocked(useSession).mockReturnValue({ data: null } as unknown as ReturnType<typeof useSession>)
		render(<HouseholdEmptyCard href='/onboarding/household' title='Add household' description='Create a new household' />)

		expect(screen.getByText('Add household')).toBeInTheDocument()
		expect(screen.getByText('Create a new household')).toBeInTheDocument()
	})

	it('disables the trigger when the session has no household count', () => {
		vi.mocked(useSession).mockReturnValue({ data: null } as unknown as ReturnType<typeof useSession>)
		render(<HouseholdEmptyCard href='/onboarding/household' title='Add household' description='Create a new household' />)

		expect(screen.getByRole('button')).toBeDisabled()
	})

	it('enables the trigger when the user has no households yet', () => {
		vi.mocked(useSession).mockReturnValue({
			data: { user: { householdIds: [] } },
		} as unknown as ReturnType<typeof useSession>)
		render(<HouseholdEmptyCard href='/onboarding/household' title='Add household' description='Create a new household' />)

		expect(screen.getByRole('button')).toBeEnabled()
	})

	it('disables the trigger when the user already has a household', () => {
		vi.mocked(useSession).mockReturnValue({
			data: { user: { householdIds: ['household-1'] } },
		} as unknown as ReturnType<typeof useSession>)
		render(<HouseholdEmptyCard href='/onboarding/household' title='Add household' description='Create a new household' />)

		expect(screen.getByRole('button')).toBeDisabled()
	})
})
