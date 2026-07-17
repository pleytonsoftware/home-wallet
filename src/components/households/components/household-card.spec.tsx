import type { HouseholdSummary } from '@households/types'

import { MemberRole } from '@lib/constants/role.enum'
import { render, screen } from '@testing-library/react'

import { HouseholdCard } from './household-card'

vi.mock('next-intl', () => ({
	useTranslations: () => (key: string, params?: Record<string, unknown>) => (params ? `${key}:${JSON.stringify(params)}` : key),
}))

vi.mock('@hooks/use-language', () => ({
	useLanguage: () => 'en-US',
}))

function makeHousehold(overrides: Partial<HouseholdSummary> = {}): HouseholdSummary {
	return {
		id: 'household-1',
		name: 'The Doe House',
		role: MemberRole.ADMIN,
		members: [
			{ id: 'member-1', name: 'Jane Doe', image: null },
			{ id: 'member-2', name: 'John Doe', image: null },
		],
		balance: 100,
		income: 500,
		spent: 400,
		currency: 'USD',
		...overrides,
	}
}

describe('HouseholdCard', () => {
	it('renders the household name', () => {
		render(<HouseholdCard household={makeHousehold()} href='/household/household-1' />)
		expect(screen.getByText('The Doe House')).toBeInTheDocument()
	})

	it('links to the given href', () => {
		render(<HouseholdCard household={makeHousehold()} href='/household/household-1' />)
		expect(screen.getByRole('link')).toHaveAttribute('href', '/household/household-1')
	})

	it('renders the member count', () => {
		render(<HouseholdCard household={makeHousehold()} href='/household/household-1' />)
		expect(screen.getByText(/members-count/)).toBeInTheDocument()
	})

	it('appends the invite code when present', () => {
		render(<HouseholdCard household={makeHousehold({ code: 'ABC123' })} href='/household/household-1' />)
		expect(screen.getByText(/ABC123/)).toBeInTheDocument()
	})

	it('does not append a code when absent', () => {
		render(<HouseholdCard household={makeHousehold({ code: undefined })} href='/household/household-1' />)
		expect(screen.queryByText(/·/)).not.toBeInTheDocument()
	})

	it('shows the active badge when isActive is true', () => {
		render(<HouseholdCard household={makeHousehold({ isActive: true })} href='/household/household-1' />)
		expect(screen.getByText('active')).toBeInTheDocument()
	})

	it('does not show the active badge by default', () => {
		render(<HouseholdCard household={makeHousehold()} href='/household/household-1' />)
		expect(screen.queryByText('active')).not.toBeInTheDocument()
	})

	it('formats and renders balance, income, and spent', () => {
		render(<HouseholdCard household={makeHousehold({ balance: 100, income: 500, spent: 400, currency: 'USD' })} href='/household/household-1' />)
		expect(screen.getByText('$100')).toBeInTheDocument()
		expect(screen.getByText('$500')).toBeInTheDocument()
		expect(screen.getByText('$400')).toBeInTheDocument()
	})

	it('renders an avatar fallback for each member', () => {
		render(
			<HouseholdCard
				household={makeHousehold({
					members: [
						{ id: 'member-1', name: 'Jane Doe', image: null },
						{ id: 'member-2', name: 'Alan Smith', image: null },
					],
				})}
				href='/household/household-1'
			/>,
		)
		expect(screen.getByText('JD')).toBeInTheDocument()
		expect(screen.getByText('AS')).toBeInTheDocument()
	})
})
