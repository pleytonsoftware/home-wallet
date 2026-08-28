import type { CategoryCombobox as CategoryComboboxType } from '@categories/components/category-combobox'
import type { CreateTransactionInput } from '@lib/schemas/transaction/create-transaction'
import type { ComponentProps } from 'react'

import { useRef } from 'react'

import { FormProvider, useForm } from 'react-hook-form'

import { PAYMENT_TYPE } from '@lib/constants/payment.enum'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { TransactionCategoryField } from './transaction-category-field'
import { TransactionFormContainerProvider } from './transaction-form.context'

const MOCK_CATEGORIES = [
	{ id: 'c-groceries', name: 'Groceries', color: 'green', icon: 'shopping-cart', isBase: true },
	{ id: 'c-income', name: 'Income', color: 'lime', icon: 'wallet', isBase: true },
]

vi.mock('next-intl', () => ({
	useTranslations: () => (key: string) => key,
}))

vi.mock('@households/context/household.context', () => ({
	useHouseholdContext: () => ({ household: { id: 'h1', config: { currency: 'USD' } } }),
}))

vi.mock('@categories/hooks/queries/get-categories-option', () => ({
	getCategoriesOptions: () => ({ queryKey: ['categories'], queryFn: () => Promise.resolve(MOCK_CATEGORIES) }),
}))

vi.mock('@categories/components/category-combobox', () => ({
	CategoryCombobox: (props: ComponentProps<typeof CategoryComboboxType>) => (
		<div data-testid='category-combobox' data-value={props.value ?? ''} data-exclude-income={String(!!props.excludeIncomeCategory)}>
			<button type='button' onClick={() => props.onChange('c-manual')}>
				pick
			</button>
		</div>
	),
}))

function Harness({ defaultType = PAYMENT_TYPE.EXPENSE }: { defaultType?: PAYMENT_TYPE }) {
	const form = useForm<CreateTransactionInput>({ defaultValues: { type: defaultType } as never })
	const containerRef = useRef<HTMLDivElement>(null)
	const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

	return (
		<QueryClientProvider client={queryClient}>
			<FormProvider {...form}>
				<TransactionFormContainerProvider value={containerRef}>
					<TransactionCategoryField />
				</TransactionFormContainerProvider>
				<span data-testid='type-value'>{form.watch('type')}</span>
				<span data-testid='category-value'>{form.watch('categoryId') ?? ''}</span>
				<button
					type='button'
					onClick={() => form.setValue('type', form.getValues('type') === PAYMENT_TYPE.INCOME ? PAYMENT_TYPE.EXPENSE : PAYMENT_TYPE.INCOME)}
				>
					toggle-type
				</button>
			</FormProvider>
		</QueryClientProvider>
	)
}

describe('TransactionCategoryField', () => {
	it('renders nothing when the type is income', async () => {
		render(<Harness defaultType={PAYMENT_TYPE.INCOME} />)

		await waitFor(() => expect(screen.getByTestId('category-value')).toHaveTextContent('c-income'))
		expect(screen.queryByTestId('category-combobox')).not.toBeInTheDocument()
	})

	it('auto-sets categoryId to the income category once categories load', async () => {
		render(<Harness defaultType={PAYMENT_TYPE.INCOME} />)

		await waitFor(() => expect(screen.getByTestId('category-value')).toHaveTextContent('c-income'))
	})

	it('renders the combobox with excludeIncomeCategory when the type is expense', async () => {
		render(<Harness defaultType={PAYMENT_TYPE.EXPENSE} />)

		await waitFor(() => expect(screen.getByTestId('category-combobox')).toBeInTheDocument())
		expect(screen.getByTestId('category-combobox')).toHaveAttribute('data-exclude-income', 'true')
	})

	it('clears a stale income categoryId when switching back to expense', async () => {
		const user = userEvent.setup()
		render(<Harness defaultType={PAYMENT_TYPE.INCOME} />)

		await waitFor(() => expect(screen.getByTestId('category-value')).toHaveTextContent('c-income'))

		await user.click(screen.getByRole('button', { name: 'toggle-type' }))

		await waitFor(() => expect(screen.getByTestId('category-value')).toHaveTextContent(''))
	})
})
