import type { CreateTransactionInput } from '@lib/schemas/transaction/create-transaction'

import { useRef } from 'react'

import { FormProvider, useForm } from 'react-hook-form'

import { RECURRENCE_FREQUENCY } from '@lib/constants/recurrence.enum'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import { TransactionFormContainerProvider } from './transaction-form.context'
import { TransactionOptionalFields } from './transaction-optional-fields'

vi.mock('next-intl', () => ({
	useTranslations: () => (key: string) => key,
}))

vi.mock('@transactions/components/transaction-form/recurrence-picker', () => ({
	RecurrencePicker: () => <div data-testid='recurrence-picker' />,
}))

function Harness({ defaultOpen = false, defaultIsRecurring = false }: { defaultOpen?: boolean; defaultIsRecurring?: boolean }) {
	const form = useForm<CreateTransactionInput>({
		defaultValues: {
			note: '',
			isRecurring: defaultIsRecurring,
			recurrenceRule: defaultIsRecurring ? { frequency: RECURRENCE_FREQUENCY.WEEKLY } : undefined,
		} as never,
	})
	const containerRef = useRef<HTMLDivElement>(null)

	return (
		<FormProvider {...form}>
			<TransactionFormContainerProvider value={containerRef}>
				<TransactionOptionalFields defaultOpen={defaultOpen} />
			</TransactionFormContainerProvider>
			<span data-testid='recurrence-rule-value'>{JSON.stringify(form.watch('recurrenceRule') ?? null)}</span>
		</FormProvider>
	)
}

describe('TransactionOptionalFields', () => {
	it('is collapsed by default when defaultOpen is false', () => {
		render(<Harness defaultOpen={false} />)
		expect(screen.queryByPlaceholderText('note.placeholder')).not.toBeInTheDocument()
	})

	it('is expanded by default when defaultOpen is true', () => {
		render(<Harness defaultOpen />)
		expect(screen.getByPlaceholderText('note.placeholder')).toBeInTheDocument()
	})

	it('toggles open when the trigger is clicked', async () => {
		const user = userEvent.setup()
		render(<Harness defaultOpen={false} />)

		await user.click(screen.getByRole('button', { name: /more-options/ }))

		expect(screen.getByPlaceholderText('note.placeholder')).toBeInTheDocument()
	})

	it('shows the RecurrencePicker only while isRecurring is true', () => {
		render(<Harness defaultOpen defaultIsRecurring />)
		expect(screen.getByTestId('recurrence-picker')).toBeInTheDocument()
	})

	it('does not show the RecurrencePicker when isRecurring is false', () => {
		render(<Harness defaultOpen defaultIsRecurring={false} />)
		expect(screen.queryByTestId('recurrence-picker')).not.toBeInTheDocument()
	})

	it('clears recurrenceRule when isRecurring is toggled off', async () => {
		const user = userEvent.setup()
		render(<Harness defaultOpen defaultIsRecurring />)

		expect(screen.getByTestId('recurrence-rule-value')).toHaveTextContent(RECURRENCE_FREQUENCY.WEEKLY)

		await user.click(screen.getByRole('switch'))

		expect(screen.getByTestId('recurrence-rule-value')).toHaveTextContent('null')
	})
})
