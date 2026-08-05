import type { HouseholdDetail } from '@households/types'

import { MemberRole } from '@lib/constants/role.enum'
import { SplitStrategy } from '@lib/constants/split-strategy.enum'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { GeneralSettingsForm } from './general-settings-form'

const { contextMock, mutateAsync } = vi.hoisted(() => ({
	contextMock: { household: {} as HouseholdDetail, isAdmin: true },
	mutateAsync: vi.fn(),
}))

vi.mock('next-intl', () => ({
	useTranslations: () => (key: string) => key,
}))

vi.mock('@households/context/household.context', () => ({
	useHouseholdContext: () => contextMock,
}))

vi.mock('@households/hooks/forms/use-general-settings-submit.hook', () => ({
	useGeneralSettingsSubmit: () => ({ mutateAsync, isPending: false }),
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
			<option value='proportional_to_income'>proportional_to_income</option>
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

function makeHousehold(overrides?: Partial<HouseholdDetail>): HouseholdDetail {
	return {
		id: 'h1',
		name: 'My House',
		fullAddress: '123 Main St',
		isOwner: true,
		role: MemberRole.ADMIN,
		balance: 0,
		income: 0,
		spent: 0,
		members: [],
		config: {
			currency: 'USD',
			defaultSplitStrategy: SplitStrategy.EQUAL,
			autoCategorize: true,
			aiAssistEnabled: false,
		},
		...overrides,
	} as HouseholdDetail
}

describe('GeneralSettingsForm', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		contextMock.household = makeHousehold()
		contextMock.isAdmin = true
	})

	it('renders the fields prefilled from the household', () => {
		render(<GeneralSettingsForm />)
		expect(screen.getByDisplayValue('My House')).toBeInTheDocument()
		expect(screen.getByDisplayValue('123 Main St')).toBeInTheDocument()
	})

	describe('as an admin', () => {
		it('shows the save button disabled while the form is pristine', () => {
			render(<GeneralSettingsForm />)
			expect(screen.getByRole('button', { name: 'save' })).toBeDisabled()
		})

		it('does not show the reset button while pristine', () => {
			render(<GeneralSettingsForm />)
			expect(screen.queryByRole('button', { name: '' })).not.toBeInTheDocument()
		})

		it('enables the save button and shows a reset button once dirty', async () => {
			const user = userEvent.setup()
			render(<GeneralSettingsForm />)

			await user.type(screen.getByDisplayValue('My House'), '!')

			await waitFor(() => expect(screen.getByRole('button', { name: 'save' })).toBeEnabled())
			// reset button is icon-only (type=reset)
			expect(document.querySelector('button[type="reset"]')).toBeInTheDocument()
		})

		it('resets the form to the original values when reset is clicked', async () => {
			const user = userEvent.setup()
			render(<GeneralSettingsForm />)

			const nameInput = screen.getByDisplayValue('My House')
			await user.type(nameInput, ' Updated')
			expect(nameInput).toHaveValue('My House Updated')

			await user.click(document.querySelector('button[type="reset"]')!)
			await waitFor(() => expect(nameInput).toHaveValue('My House'))
		})

		it('submits the mutation with the edited values through the confirm dialog', async () => {
			mutateAsync.mockResolvedValue(undefined)
			const user = userEvent.setup()
			render(<GeneralSettingsForm />)

			await user.type(screen.getByDisplayValue('My House'), ' Updated')
			await user.click(screen.getByRole('button', { name: 'save' }))
			await user.click(screen.getByRole('button', { name: 'confirm' }))

			await waitFor(() => expect(mutateAsync).toHaveBeenCalledTimes(1))
			expect(mutateAsync).toHaveBeenCalledWith(expect.objectContaining({ name: 'My House Updated', currency: 'USD' }))
		})
	})

	describe('as a non-admin (read-only)', () => {
		beforeEach(() => {
			contextMock.isAdmin = false
		})

		it('hides the footer actions', () => {
			render(<GeneralSettingsForm />)
			expect(screen.queryByRole('button', { name: 'save' })).not.toBeInTheDocument()
			expect(document.querySelector('button[type="reset"]')).not.toBeInTheDocument()
		})

		it('disables the inputs', () => {
			render(<GeneralSettingsForm />)
			expect(screen.getByDisplayValue('My House')).toBeDisabled()
			expect(screen.getByTestId('currency')).toBeDisabled()
		})
	})
})
