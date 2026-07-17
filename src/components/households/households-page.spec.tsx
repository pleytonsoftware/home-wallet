import { useQuery } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'

import { HouseholdsPage } from './households-page'

vi.mock('next-intl', () => ({
	useTranslations: () => (key: string) => key,
}))

vi.mock('@tanstack/react-query', async (importOriginal) => ({
	...(await importOriginal<typeof import('@tanstack/react-query')>()),
	useQuery: vi.fn(),
}))

vi.mock('@households/components/households-header', () => ({
	HouseholdsHeader: ({ title }: { title: string }) => <h1>{title}</h1>,
}))

vi.mock('@households/components/household-join-banner', () => ({
	HouseholdJoinBanner: ({ title }: { title: string }) => <div data-testid='join-banner'>{title}</div>,
}))

vi.mock('@households/components/households-grid', async () => {
	const { useHouseholdsContext } = await import('@households/context/households.context')
	return {
		HouseholdsGrid: () => {
			const { households, isLoading, isError } = useHouseholdsContext()
			return <div data-testid='context-probe'>{JSON.stringify({ count: households.length, isLoading, isError })}</div>
		},
	}
})

describe('HouseholdsPage', () => {
	it('renders the header, grid, and join banner', () => {
		vi.mocked(useQuery).mockReturnValue({ data: [], isLoading: false, isError: false } as unknown as ReturnType<typeof useQuery>)
		render(<HouseholdsPage households={[]} />)

		expect(screen.getByRole('heading', { name: 'title' })).toBeInTheDocument()
		expect(screen.getByTestId('join-banner')).toBeInTheDocument()
		expect(screen.getByTestId('context-probe')).toBeInTheDocument()
	})

	it('provides the fetched households and loading/error state via context', () => {
		vi.mocked(useQuery).mockReturnValue({
			data: [{ id: 'household-1' }],
			isLoading: true,
			isError: false,
		} as unknown as ReturnType<typeof useQuery>)
		render(<HouseholdsPage households={[]} />)

		expect(screen.getByTestId('context-probe')).toHaveTextContent(JSON.stringify({ count: 1, isLoading: true, isError: false }))
	})

	it('defaults households to an empty array when the query has no data yet', () => {
		vi.mocked(useQuery).mockReturnValue({ data: undefined, isLoading: true, isError: false } as unknown as ReturnType<typeof useQuery>)
		render(<HouseholdsPage households={[]} />)

		expect(screen.getByTestId('context-probe')).toHaveTextContent(JSON.stringify({ count: 0, isLoading: true, isError: false }))
	})

	it('surfaces a query error via context', () => {
		vi.mocked(useQuery).mockReturnValue({ data: [], isLoading: false, isError: true } as unknown as ReturnType<typeof useQuery>)
		render(<HouseholdsPage households={[]} />)

		expect(screen.getByTestId('context-probe')).toHaveTextContent(JSON.stringify({ count: 0, isLoading: false, isError: true }))
	})
})
