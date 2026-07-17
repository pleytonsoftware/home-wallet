import { useRouter } from 'next/navigation'

import { createHousehold } from '@actions/household/create'
import { useDetectedCurrency } from '@hooks/use-detected-currency'
import { OnboardingProvider } from '@households/onboarding/context/onboarding.context'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { OnboardingCreate } from './onboarding-create'

vi.mock('next-intl', () => ({
	useTranslations: () => (key: string) => key,
}))

vi.mock('next/navigation', () => ({
	useRouter: vi.fn(),
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

vi.mock('@molecules/split-strategy-dropdown', () => ({
	SplitStrategyLabel: ({ label }: { label: string }) => <label>{label}</label>,
	SplitStrategyDropdown: ({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled?: boolean }) => (
		<select data-testid='split-strategy' value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)}>
			<option value='equal'>equal</option>
			<option value='custom_percentages'>custom_percentages</option>
		</select>
	),
}))

const push = vi.fn()

function renderCreate() {
	return render(
		<OnboardingProvider value={{ view: 'create', setView: vi.fn() }}>
			<OnboardingCreate />
		</OnboardingProvider>,
	)
}

describe('OnboardingCreate', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		vi.mocked(useDetectedCurrency).mockReturnValue({ currency: 'USD', detectedAt: undefined, isFetching: false, error: null, isError: false })
		vi.mocked(useRouter).mockReturnValue({ push } as unknown as ReturnType<typeof useRouter>)
	})

	it('renders the name input and submit button', () => {
		renderCreate()
		expect(screen.getByPlaceholderText('name.placeholder')).toBeInTheDocument()
		expect(screen.getByRole('button', { name: 'submit-button' })).toBeInTheDocument()
	})

	it('keeps the currency and split-strategy fields collapsed by default', () => {
		renderCreate()
		expect(screen.queryByTestId('currency')).not.toBeInTheDocument()
	})

	it('reveals the currency and split-strategy fields when customize is expanded', async () => {
		const user = userEvent.setup()
		renderCreate()

		await user.click(screen.getByRole('button', { name: /customize/ }))

		expect(screen.getByTestId('currency')).toBeInTheDocument()
		expect(screen.getByTestId('split-strategy')).toBeInTheDocument()
	})

	it('submits with just the household name', async () => {
		vi.mocked(createHousehold).mockResolvedValue({ success: true, data: {} } as Awaited<ReturnType<typeof createHousehold>>)
		const user = userEvent.setup()
		renderCreate()

		await user.type(screen.getByPlaceholderText('name.placeholder'), 'My Household')
		await user.click(screen.getByRole('button', { name: 'submit-button' }))

		await waitFor(() => expect(createHousehold).toHaveBeenCalledWith('My Household'))
	})

	it('navigates to households on success', async () => {
		vi.mocked(createHousehold).mockResolvedValue({ success: true, data: {} } as Awaited<ReturnType<typeof createHousehold>>)
		const user = userEvent.setup()
		renderCreate()

		await user.type(screen.getByPlaceholderText('name.placeholder'), 'My Household')
		await user.click(screen.getByRole('button', { name: 'submit-button' }))

		await waitFor(() => expect(push).toHaveBeenCalledWith('/households'))
	})

	it('shows a root error and does not navigate on a generic failure', async () => {
		vi.mocked(createHousehold).mockResolvedValue({ success: false, error: 'Something failed' } as Awaited<ReturnType<typeof createHousehold>>)
		const user = userEvent.setup()
		renderCreate()

		await user.type(screen.getByPlaceholderText('name.placeholder'), 'My Household')
		await user.click(screen.getByRole('button', { name: 'submit-button' }))

		expect(await screen.findByText('Something failed')).toBeInTheDocument()
		expect(push).not.toHaveBeenCalled()
	})
})
