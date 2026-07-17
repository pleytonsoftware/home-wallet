import type { HouseholdSummary } from '@households/types'

import { useHouseholdsContext } from '@households/context/households.context'
import { MemberRole } from '@lib/constants/role.enum'
import { render, screen } from '@testing-library/react'

import { HouseholdsGrid } from './households-grid'

vi.mock('next-intl', () => ({
	useTranslations: () => (key: string) => key,
}))

vi.mock('@households/context/households.context', () => ({
	useHouseholdsContext: vi.fn(),
}))

vi.mock('@households/components/household-card', () => ({
	HouseholdCard: ({ household, href }: { household: HouseholdSummary; href: string }) => (
		<a href={href} data-testid={`household-card-${household.id}`}>
			{household.name}
		</a>
	),
}))

vi.mock('@households/components/household-empty-card', () => ({
	HouseholdEmptyCard: () => <div data-testid='household-empty-card' />,
}))

function makeHousehold(overrides: Partial<HouseholdSummary> = {}): HouseholdSummary {
	return {
		id: 'household-1',
		name: 'The Doe House',
		role: MemberRole.ADMIN,
		members: [],
		balance: 0,
		income: 0,
		spent: 0,
		...overrides,
	}
}

describe('HouseholdsGrid', () => {
	it('renders a card for each household with the correct href', () => {
		vi.mocked(useHouseholdsContext).mockReturnValue({
			households: [makeHousehold({ id: 'household-1' }), makeHousehold({ id: 'household-2' })],
		})
		render(<HouseholdsGrid />)

		expect(screen.getByTestId('household-card-household-1')).toHaveAttribute('href', '/household/household-1')
		expect(screen.getByTestId('household-card-household-2')).toHaveAttribute('href', '/household/household-2')
	})

	it('always renders the empty card', () => {
		vi.mocked(useHouseholdsContext).mockReturnValue({ households: [] })
		render(<HouseholdsGrid />)

		expect(screen.getByTestId('household-empty-card')).toBeInTheDocument()
	})

	it('renders no household cards when there are no households', () => {
		vi.mocked(useHouseholdsContext).mockReturnValue({ households: [] })
		render(<HouseholdsGrid />)

		expect(screen.queryByTestId(/household-card-/)).not.toBeInTheDocument()
	})
})
