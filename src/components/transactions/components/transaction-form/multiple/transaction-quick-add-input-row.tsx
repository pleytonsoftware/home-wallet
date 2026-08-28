'use client'

import type { FC } from 'react'

import { CheckIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Controller, FormProvider, useWatch } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@atoms/button'
import { Icon } from '@atoms/icon'
import { Input } from '@atoms/input'
import { useHouseholdContext } from '@households/context/household.context'
import { getDefaultTransactionDate, lastDayOfMonthUtc } from '@lib/utils/monthly-budget.utils'
import { CurrencyInput } from '@molecules/currency-input'
import { MONTHLY_BUDGETS_QUERY_KEYS } from '@monthly-budgets/constants/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { TRANSACTIONS_QUERY_KEYS } from '@transactions/constants/query-keys'
import { useTransactionForm } from '@transactions/hooks/forms/use-transaction-form.hook'
import { createTransactionMutationOptions } from '@transactions/hooks/mutations/create-transaction.hook'

import { makeEmptyDraftRow } from './transaction-draft.utils'
import { QUICK_ADD_ROW_GRID_CLASS } from './transaction-quick-add.utils'
import { TransactionRowAccountCell } from './transaction-row-account-cell'
import { TransactionRowCategoryCell } from './transaction-row-category-cell'
import { TransactionRowDateCell } from './transaction-row-date-cell'
import { TransactionRowRecurrenceCell } from './transaction-row-recurrence-cell'
import { TransactionRowTypeCell } from './transaction-row-type-cell'

interface TransactionQuickAddInputRowProps {
	monthlyBudgetId: string
	monthlyBudgetMonth: Date
}

/** The always-at-the-bottom single-line input row — its check button saves immediately and individually. */
export const TransactionQuickAddInputRow: FC<TransactionQuickAddInputRowProps> = ({ monthlyBudgetId, monthlyBudgetMonth }) => {
	const t = useTranslations('transactions-personal-page.form')
	const tSchema = useTranslations('common.forms.transactions.create')
	const { household } = useHouseholdContext()
	const queryClient = useQueryClient()
	const defaultDate = getDefaultTransactionDate(monthlyBudgetMonth)

	const form = useTransactionForm({ mode: 'create', schemaParams: tSchema, defaultDate })
	const mutation = useMutation(createTransactionMutationOptions(monthlyBudgetId))
	const disabled = form.formState.isSubmitting
	const type = useWatch({ control: form.control, name: 'type' })

	const handleAccept = form.handleSubmit(async (data) => {
		const res = await mutation.mutateAsync(data)
		if (!res.success) {
			toast.error(typeof res.error === 'string' ? res.error : t('error'))
			return
		}
		await Promise.all([
			queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEYS.transactions(household.id, monthlyBudgetId) }),
			queryClient.invalidateQueries({ queryKey: MONTHLY_BUDGETS_QUERY_KEYS.all(household.id) }),
		])
		form.reset(makeEmptyDraftRow(defaultDate))
		form.setFocus('name')
		toast.success(t('created'))
	})

	return (
		<FormProvider {...form}>
			<div className={`${QUICK_ADD_ROW_GRID_CLASS} rounded-md border border-primary/30 bg-primary/5 px-2 py-1`}>
				<TransactionRowTypeCell name='type' disabled={disabled} />

				<Input {...form.register('name')} placeholder={t('name.placeholder')} disabled={disabled} />

				<Controller
					name='amount'
					control={form.control}
					render={({ field }) => (
						<CurrencyInput
							name={field.name}
							value={field.value ?? ''}
							onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
							onBlur={field.onBlur}
							ref={field.ref}
							currency={household.config.currency}
							transactionType={type}
							disabled={disabled}
						/>
					)}
				/>

				<TransactionRowCategoryCell name='categoryId' typeName='type' householdId={household.id} disabled={disabled} />
				<TransactionRowAccountCell name='sourceAccountId' householdId={household.id} disabled={disabled} />
				<TransactionRowDateCell
					name='date'
					disabled={disabled}
					fromDate={monthlyBudgetMonth}
					toDate={lastDayOfMonthUtc(monthlyBudgetMonth)}
				/>
				<TransactionRowRecurrenceCell isRecurringName='isRecurring' recurrenceRuleName='recurrenceRule' disabled={disabled} />

				<Button type='button' size='icon-sm' aria-label={t('submit-button.create')} onClick={handleAccept} loading={disabled}>
					<Icon IconComponent={CheckIcon} size='sm' />
				</Button>
			</div>
		</FormProvider>
	)
}
