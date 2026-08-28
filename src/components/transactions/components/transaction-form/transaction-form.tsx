'use client'

import type { CreateEditMode } from '@lib/types/mode'
import type { TransactionSummary } from '@transactions/types'
import type { RefObject, FC } from 'react'

import { useCallback } from 'react'

import { useTranslations } from 'next-intl'
import { Controller, FormProvider, useWatch } from 'react-hook-form'

import { Button } from '@atoms/button'
import { Field, FieldError, FieldLabel } from '@atoms/field'
import { Input } from '@atoms/input'
import { Kbd } from '@atoms/kbd'
import { useHouseholdContext } from '@households/context/household.context'
import { getDefaultTransactionDate, lastDayOfMonthUtc } from '@lib/utils/monthly-budget.utils'
import { CurrencyInput } from '@molecules/currency-input'
import { DatePicker } from '@molecules/date-picker'
import { TransactionAccountField } from '@transactions/components/transaction-form/transaction-account-field'
import { TransactionCategoryField } from '@transactions/components/transaction-form/transaction-category-field'
import { TransactionFormContainerProvider } from '@transactions/components/transaction-form/transaction-form.context'
import { TransactionOptionalFields } from '@transactions/components/transaction-form/transaction-optional-fields'
import { TransactionTypeField } from '@transactions/components/transaction-form/transaction-type-field'
import { useTransactionForm } from '@transactions/hooks/forms/use-transaction-form.hook'
import { useTransactionSubmit } from '@transactions/hooks/forms/use-transaction-submit.hook'

interface TransactionFormProps {
	mode: CreateEditMode
	transaction?: TransactionSummary
	monthlyBudgetId: string
	monthlyBudgetMonth: Date
	containerRef: RefObject<HTMLDivElement | null>
	onSuccess: () => void
	onCancel: () => void
}

export const TransactionForm: FC<TransactionFormProps> = ({
	mode,
	transaction,
	monthlyBudgetId,
	monthlyBudgetMonth,
	containerRef,
	onSuccess,
	onCancel,
}) => {
	const t = useTranslations('transactions-personal-page.form')
	const tSchema = useTranslations('common.forms.transactions.create')
	const { household } = useHouseholdContext()

	const defaultOpen = mode === 'edit' && (!!transaction?.note || transaction?.isRecurring === true)

	const form = useTransactionForm({
		mode,
		schemaParams: tSchema,
		initialData: transaction,
		defaultDate: getDefaultTransactionDate(monthlyBudgetMonth),
	})
	const mutation = useTransactionSubmit({
		mode,
		householdId: household.id,
		monthlyBudgetId,
		transactionId: transaction?.id,
		form,
		onSuccess,
	})
	const handleSubmit = useCallback<Parameters<typeof form.handleSubmit>[0]>((data) => mutation.mutateAsync(data), [mutation])
	const type = useWatch({ control: form.control, name: 'type' })

	return (
		<FormProvider {...form}>
			<TransactionFormContainerProvider value={containerRef}>
				<form
					onSubmit={form.handleSubmit(handleSubmit)}
					onKeyDown={(event) => {
						if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
							event.preventDefault()
							event.currentTarget.requestSubmit()
						}
					}}
					className='flex flex-1 flex-col gap-6'
				>
					<TransactionTypeField />

					<Controller
						name='name'
						control={form.control}
						render={({ field, fieldState }) => (
							<Field data-invalid={!!fieldState.error}>
								<FieldLabel htmlFor={field.name} required>
									{t('name.label')}
								</FieldLabel>
								<Input {...field} disabled={form.formState.isSubmitting} placeholder={t('name.placeholder')} autoFocus />
								{fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
							</Field>
						)}
					/>

					<div className='grid grid-cols-2 gap-4'>
						<Controller
							name='amount'
							control={form.control}
							render={({ field, fieldState }) => (
								<Field data-invalid={!!fieldState.error}>
									<FieldLabel htmlFor={field.name} required>
										{t('amount.label')}
									</FieldLabel>
									<CurrencyInput
										name={field.name}
										value={field.value ?? ''}
										onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
										onBlur={field.onBlur}
										ref={field.ref}
										currency={household.config.currency}
										transactionType={type}
										disabled={form.formState.isSubmitting}
									/>
									{fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
								</Field>
							)}
						/>

						<Controller
							name='date'
							control={form.control}
							render={({ field, fieldState }) => (
								<Field data-invalid={!!fieldState.error}>
									<FieldLabel htmlFor={field.name} required>
										{t('date.label')}
									</FieldLabel>
									<DatePicker
										id={field.name}
										value={field.value}
										onChange={(date) => date && field.onChange(date)}
										placeholder={t('date.placeholder')}
										disabled={form.formState.isSubmitting}
										fromDate={monthlyBudgetMonth}
										toDate={lastDayOfMonthUtc(monthlyBudgetMonth)}
									/>
									{fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
								</Field>
							)}
						/>
					</div>

					<div className='grid grid-cols-2 gap-4'>
						<TransactionCategoryField />
						<TransactionAccountField />
					</div>
					<TransactionOptionalFields defaultOpen={defaultOpen} />

					{form.formState.errors.root && <FieldError>{form.formState.errors.root.message}</FieldError>}

					<div className='mt-auto flex gap-2'>
						<Button type='button' variant='outline' className='flex-1' onClick={onCancel} disabled={form.formState.isSubmitting}>
							{t('cancel-button')}
						</Button>
						<Button type='submit' className='flex-1 gap-2' disabled={!form.formState.isValid} loading={form.formState.isSubmitting}>
							{mode === 'create' ? t('submit-button.create') : t('submit-button.edit')}
							<Kbd className='bg-primary-foreground/15 text-primary-foreground'>⌘Enter</Kbd>
						</Button>
					</div>
				</form>
			</TransactionFormContainerProvider>
		</FormProvider>
	)
}
