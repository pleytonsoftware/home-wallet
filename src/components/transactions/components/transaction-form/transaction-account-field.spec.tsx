import type { CreateTransactionInput } from '@lib/schemas/transaction/create-transaction'

import { useRef } from 'react'

import { FormProvider, useForm } from 'react-hook-form'

import { ACCOUNT_TYPE } from '@lib/constants/account.enum'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { TransactionAccountField } from './transaction-account-field'
import { TransactionFormContainerProvider } from './transaction-form.context'

let mockAccounts: Array<{ id: string; name: string; type: ACCOUNT_TYPE; lastFourDigits?: string | null }> = []

beforeAll(() => {
	globalThis.ResizeObserver = class ResizeObserver {
		observe() {}
		unobserve() {}
		disconnect() {}
	}
})

vi.mock('next-intl', () => ({
	useTranslations: () => (key: string) => key,
}))

vi.mock('@hooks/use-native-mobile', () => ({
	useIsNativeMobile: vi.fn(() => false),
}))

vi.mock('@households/context/household.context', () => ({
	useHouseholdContext: () => ({ household: { id: 'h1', config: { currency: 'USD' } } }),
}))

vi.mock('@bank-accounts/hooks/queries/get-bank-accounts-option', () => ({
	getBankAccountsOptions: () => ({ queryKey: ['bank-accounts'], queryFn: () => Promise.resolve(mockAccounts) }),
}))

function Harness() {
	const form = useForm<CreateTransactionInput>({ defaultValues: {} as never })
	const containerRef = useRef<HTMLDivElement>(null)
	const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

	return (
		<QueryClientProvider client={queryClient}>
			<FormProvider {...form}>
				<TransactionFormContainerProvider value={containerRef}>
					<TransactionAccountField />
				</TransactionFormContainerProvider>
				<span data-testid='account-value'>{form.watch('sourceAccountId') ?? ''}</span>
			</FormProvider>
		</QueryClientProvider>
	)
}

describe('TransactionAccountField', () => {
	beforeEach(() => {
		mockAccounts = [
			{ id: 'a1', name: 'Checking', type: ACCOUNT_TYPE.BANK, lastFourDigits: '1234' },
			{ id: 'a2', name: 'Wallet Cash', type: ACCOUNT_TYPE.CASH, lastFourDigits: null },
		]
	})

	it('renders nothing when there are no bank accounts', async () => {
		mockAccounts = []
		const { container } = render(<Harness />)

		await waitFor(() => expect(container.querySelector('[role="button"], button')).not.toBeInTheDocument())
	})

	it('defaults the trigger to "no account"', async () => {
		render(<Harness />)
		await waitFor(() => expect(screen.getByRole('button')).toHaveAttribute('aria-label', 'account.none'))
	})

	it('shows the account name and masked last-4-digits for each option', async () => {
		const user = userEvent.setup()
		render(<Harness />)

		await waitFor(() => expect(screen.getByRole('button')).toBeInTheDocument())
		await user.click(screen.getByRole('button'))

		expect(screen.getByText('· •••• 1234')).toBeInTheDocument()
		expect(screen.getByText('Checking')).toBeInTheDocument()
		expect(screen.getByText('Wallet Cash')).toBeInTheDocument()
	})

	it('selecting an account sets the form value', async () => {
		const user = userEvent.setup()
		render(<Harness />)

		await waitFor(() => expect(screen.getByRole('button')).toBeInTheDocument())
		await user.click(screen.getByRole('button'))
		await user.click(screen.getByText('Checking'))

		expect(screen.getByTestId('account-value')).toHaveTextContent('a1')
	})

	it('selecting "no account" clears the form value', async () => {
		const user = userEvent.setup()
		render(<Harness />)

		await waitFor(() => expect(screen.getByRole('button')).toBeInTheDocument())
		await user.click(screen.getByRole('button'))
		await user.click(screen.getByText('Checking'))
		expect(screen.getByTestId('account-value')).toHaveTextContent('a1')

		await user.click(screen.getByRole('button'))
		await user.click(screen.getByText('account.none'))

		expect(screen.getByTestId('account-value')).toHaveTextContent('')
	})
})
