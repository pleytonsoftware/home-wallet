import { useRouter } from 'next/navigation'

import { createHousehold } from '@actions/household/create'
import { useDetectedCurrency } from '@hooks/use-detected-currency'
import { useQueryClient } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { HouseholdCreateForm } from './household-create-form'

vi.mock('next-intl', () => ({
	useTranslations: () => (key: string) => key,
}))

vi.mock('next/navigation', () => ({
	useRouter: vi.fn(),
}))

vi.mock('@tanstack/react-query', () => ({
	useQueryClient: vi.fn(),
}))

vi.mock('@hooks/use-detected-currency', () => ({
	useDetectedCurrency: vi.fn(),
}))

vi.mock('@actions/household/create', () => ({
	createHousehold: vi.fn(),
}))

vi.mock('@molecules/currency-combobox', () => ({
	CurrencyCombobox: ({ value, onChange, disabled }: { value?: string; onChange: (v: string) => void; disabled?: boolean }) => (
		<select data-testid='currency' value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)}>
			<option value='USD'>USD</option>
			<option value='EUR'>EUR</option>
		</select>
	),
}))

vi.mock('@households/components/split-strategy-dropdown', () => ({
	SplitStrategyLabel: ({ label }: { label: string }) => <label>{label}</label>,
	SplitStrategyDropdown: ({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled?: boolean }) => (
		<select data-testid='split-strategy' value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)}>
			<option value='equal'>equal</option>
			<option value='custom_percentages'>custom_percentages</option>
		</select>
	),
}))

beforeAll(() => {
	globalThis.ResizeObserver = class ResizeObserver {
		observe() {}
		unobserve() {}
		disconnect() {}
	}
})

const setOpen = vi.fn()
const containerRef = { current: null }
const invalidateQueries = vi.fn()
const refresh = vi.fn()

function renderForm() {
	return render(<HouseholdCreateForm setOpen={setOpen} containerRef={containerRef} />)
}

describe('HouseholdCreateForm', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		vi.mocked(useDetectedCurrency).mockReturnValue({ currency: 'USD', detectedAt: undefined, isFetching: false, error: null, isError: false })
		vi.mocked(useRouter).mockReturnValue({ refresh } as unknown as ReturnType<typeof useRouter>)
		vi.mocked(useQueryClient).mockReturnValue({ invalidateQueries } as unknown as ReturnType<typeof useQueryClient>)
	})

	it('renders the name input and disables submit until valid', () => {
		renderForm()
		expect(screen.getByPlaceholderText('name.placeholder')).toBeInTheDocument()
		expect(screen.getByRole('button', { name: 'submit-button' })).toBeDisabled()
	})

	it('enables submit once a name is entered', async () => {
		const user = userEvent.setup()
		renderForm()

		await user.type(screen.getByPlaceholderText('name.placeholder'), 'My Household')

		await waitFor(() => expect(screen.getByRole('button', { name: 'submit-button' })).toBeEnabled())
	})

	it('submits the form with the entered values', async () => {
		vi.mocked(createHousehold).mockResolvedValue({ success: true, data: {} } as Awaited<ReturnType<typeof createHousehold>>)
		const user = userEvent.setup()
		renderForm()

		await user.type(screen.getByPlaceholderText('name.placeholder'), 'My Household')
		await user.click(screen.getByRole('button', { name: 'submit-button' }))

		await waitFor(() =>
			expect(createHousehold).toHaveBeenCalledWith(
				'My Household',
				expect.objectContaining({ currency: 'USD', splitStrategy: 'equal', autoCategorize: true }),
			),
		)
	})

	it('closes the sheet, invalidates queries, and refreshes on success', async () => {
		vi.mocked(createHousehold).mockResolvedValue({ success: true, data: {} } as Awaited<ReturnType<typeof createHousehold>>)
		const user = userEvent.setup()
		renderForm()

		await user.type(screen.getByPlaceholderText('name.placeholder'), 'My Household')
		await user.click(screen.getByRole('button', { name: 'submit-button' }))

		await waitFor(() => expect(setOpen).toHaveBeenCalledWith(false))
		expect(invalidateQueries).toHaveBeenCalledWith(expect.objectContaining({ queryKey: ['households'] }))
		expect(refresh).toHaveBeenCalled()
	})

	it('shows a root error and does not close on a generic failure', async () => {
		vi.mocked(createHousehold).mockResolvedValue({ success: false, error: 'Something failed' } as Awaited<ReturnType<typeof createHousehold>>)
		const user = userEvent.setup()
		renderForm()

		await user.type(screen.getByPlaceholderText('name.placeholder'), 'My Household')
		await user.click(screen.getByRole('button', { name: 'submit-button' }))

		expect(await screen.findByText('Something failed')).toBeInTheDocument()
		expect(setOpen).not.toHaveBeenCalled()
	})

	it('maps field-level validation errors from the server response', async () => {
		vi.mocked(createHousehold).mockResolvedValue({
			success: false,
			error: [{ path: ['name'], code: 'custom', message: 'Name already taken' }],
		} as unknown as Awaited<ReturnType<typeof createHousehold>>)
		const user = userEvent.setup()
		renderForm()

		await user.type(screen.getByPlaceholderText('name.placeholder'), 'My Household')
		await user.click(screen.getByRole('button', { name: 'submit-button' }))

		await waitFor(() => expect(screen.getAllByText('Name already taken').length).toBeGreaterThan(0))
	})
})
