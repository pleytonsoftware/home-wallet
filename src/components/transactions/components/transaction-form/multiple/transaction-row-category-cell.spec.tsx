import type { CategoryCombobox as CategoryComboboxType } from '@categories/components/category-combobox'
import type { ComponentProps } from 'react'

import { useRef } from 'react'

import { FormProvider, useForm } from 'react-hook-form'

import { PAYMENT_TYPE } from '@lib/constants/payment.enum'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TransactionFormContainerProvider } from '@transactions/components/transaction-form/transaction-form.context'

import { TransactionRowCategoryCell } from './transaction-row-category-cell'

const MOCK_CATEGORIES = [
	{ id: 'c-groceries', name: 'Groceries', color: 'green', icon: 'shopping-cart', isBase: true },
	{ id: 'c-income', name: 'Income', color: 'lime', icon: 'wallet', isBase: true },
]

vi.mock('@categories/hooks/queries/get-categories-option', () => ({
	getCategoriesOptions: () => ({ queryKey: ['categories'], queryFn: () => Promise.resolve(MOCK_CATEGORIES) }),
}))

vi.mock('@categories/components/category-combobox', () => ({
	CategoryCombobox: (props: ComponentProps<typeof CategoryComboboxType>) => (
		<div data-testid='category-combobox' data-value={props.value ?? ''} data-disabled={String(!!props.disabled)}>
			<button type='button' onClick={() => props.onChange('c-manual')}>
				pick
			</button>
		</div>
	),
}))

function Harness({ defaultType = PAYMENT_TYPE.EXPENSE }: { defaultType?: PAYMENT_TYPE }) {
	const form = useForm({ defaultValues: { type: defaultType, categoryId: undefined as string | undefined } })
	const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
	const containerRef = useRef<HTMLDivElement>(null)

	return (
		<QueryClientProvider client={queryClient}>
			<TransactionFormContainerProvider value={containerRef}>
				<FormProvider {...form}>
					<TransactionRowCategoryCell name='categoryId' typeName='type' householdId='h1' />
					<span data-testid='category-value'>{form.watch('categoryId') ?? ''}</span>
					<button
						type='button'
						onClick={() =>
							form.setValue('type', form.getValues('type') === PAYMENT_TYPE.INCOME ? PAYMENT_TYPE.EXPENSE : PAYMENT_TYPE.INCOME)
						}
					>
						toggle-type
					</button>
				</FormProvider>
			</TransactionFormContainerProvider>
		</QueryClientProvider>
	)
}

describe('TransactionRowCategoryCell', () => {
	it('keeps the combobox visible but disabled for an income row, auto-set to the base Income category', async () => {
		render(<Harness defaultType={PAYMENT_TYPE.INCOME} />)

		await waitFor(() => expect(screen.getByTestId('category-value')).toHaveTextContent('c-income'))
		expect(screen.getByTestId('category-combobox')).toHaveAttribute('data-disabled', 'true')
	})

	it('renders the combobox enabled for an expense row', async () => {
		render(<Harness defaultType={PAYMENT_TYPE.EXPENSE} />)

		await waitFor(() => expect(screen.getByTestId('category-combobox')).toBeInTheDocument())
		expect(screen.getByTestId('category-combobox')).toHaveAttribute('data-disabled', 'false')
	})

	it('unlocks the combobox again when switching back to expense', async () => {
		const user = userEvent.setup()
		render(<Harness defaultType={PAYMENT_TYPE.INCOME} />)

		await waitFor(() => expect(screen.getByTestId('category-value')).toHaveTextContent('c-income'))

		await user.click(screen.getByRole('button', { name: 'toggle-type' }))

		await waitFor(() => expect(screen.getByTestId('category-combobox')).toHaveAttribute('data-disabled', 'false'))
	})

	it('clears the forced income categoryId when switching back to expense (regression)', async () => {
		const user = userEvent.setup()
		render(<Harness defaultType={PAYMENT_TYPE.INCOME} />)

		await waitFor(() => expect(screen.getByTestId('category-value')).toHaveTextContent('c-income'))

		await user.click(screen.getByRole('button', { name: 'toggle-type' }))

		await waitFor(() => expect(screen.getByTestId('category-value')).toHaveTextContent(''))
	})
})
