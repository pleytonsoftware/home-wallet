import type { CreateTransactionInput } from '@lib/schemas/transaction/create-transaction'

import { FormProvider, useForm } from 'react-hook-form'

import { PAYMENT_TYPE } from '@lib/constants/payment.enum'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { TransactionTypeField } from './transaction-type-field'

vi.mock('next-intl', () => ({
	useTranslations: () => (key: string) => key,
}))

function Harness({ onSubmit }: { onSubmit?: () => Promise<void> }) {
	const form = useForm<CreateTransactionInput>({ defaultValues: { type: PAYMENT_TYPE.EXPENSE } as never })

	return (
		<FormProvider {...form}>
			<form onSubmit={form.handleSubmit(onSubmit ?? (() => Promise.resolve()))}>
				<TransactionTypeField />
				<span data-testid='type-value'>{form.watch('type')}</span>
				<button type='submit'>submit</button>
			</form>
		</FormProvider>
	)
}

describe('TransactionTypeField', () => {
	it('renders both the expense and income options', () => {
		render(<Harness />)
		expect(screen.getByRole('button', { name: 'expense' })).toBeInTheDocument()
		expect(screen.getByRole('button', { name: 'income' })).toBeInTheDocument()
	})

	it('defaults to the form value', () => {
		render(<Harness />)
		expect(screen.getByTestId('type-value')).toHaveTextContent(PAYMENT_TYPE.EXPENSE)
	})

	it('updates the form value when income is clicked', async () => {
		const user = userEvent.setup()
		render(<Harness />)

		await user.click(screen.getByRole('button', { name: 'income' }))

		expect(screen.getByTestId('type-value')).toHaveTextContent(PAYMENT_TYPE.INCOME)
	})

	it('updates the form value back to expense when clicked again', async () => {
		const user = userEvent.setup()
		render(<Harness />)

		await user.click(screen.getByRole('button', { name: 'income' }))
		await user.click(screen.getByRole('button', { name: 'expense' }))

		expect(screen.getByTestId('type-value')).toHaveTextContent(PAYMENT_TYPE.EXPENSE)
	})

	it('disables both options while the form is submitting', async () => {
		const user = userEvent.setup()
		render(<Harness onSubmit={() => new Promise(() => {})} />)

		await user.click(screen.getByRole('button', { name: 'submit' }))

		await waitFor(() => expect(screen.getByRole('button', { name: 'expense' })).toBeDisabled())
		expect(screen.getByRole('button', { name: 'income' })).toBeDisabled()
	})
})
