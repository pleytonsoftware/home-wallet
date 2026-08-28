'use client'

import type { RecurringSeriesSummary } from '@transactions/types'
import type { FC, RefObject } from 'react'

import { useCallback } from 'react'

import { useTranslations } from 'next-intl'
import { Controller, FormProvider } from 'react-hook-form'

import { Button } from '@atoms/button'
import { Field, FieldError, FieldLabel } from '@atoms/field'
import { Icon } from '@atoms/icon'
import { Input } from '@atoms/input'
import { Textarea } from '@atoms/textarea'
import { BankAccountOption, BankAccountTrigger } from '@bank-accounts/components/bank-account-option'
import { getBankAccountsOptions } from '@bank-accounts/hooks/queries/get-bank-accounts-option'
import { formatBankAccountLabel } from '@bank-accounts/utils'
import { CategoryCombobox } from '@categories/components/category-combobox'
import { getCategoriesOptions } from '@categories/hooks/queries/get-categories-option'
import { useHouseholdContext } from '@households/context/household.context'
import { PAYMENT_TYPE } from '@lib/constants/payment.enum'
import { CurrencyInput } from '@molecules/currency-input'
import { EnumDropdown } from '@molecules/enum-dropdown'
import { useQuery } from '@tanstack/react-query'
import { RecurrencePicker } from '@transactions/components/transaction-form/recurrence-picker'
import { TransactionTypeIcon } from '@transactions/constants/transaction-type-icon'

import { useRecurringSeriesForm } from './use-recurring-series-form.hook'
import { useRecurringSeriesSubmit } from './use-recurring-series-submit.hook'

const NO_ACCOUNT_VALUE = '__none__'

interface RecurringSeriesFormProps {
	householdId: string
	series: RecurringSeriesSummary
	containerRef: RefObject<HTMLDivElement | null>
	onSuccess: () => void
	onCancel: () => void
}

/** Dedicated, simpler edit form for a recurring series' template — name/amount/type/category/account/note/recurrence-rule, no raw date field. */
export const RecurringSeriesForm: FC<RecurringSeriesFormProps> = ({ householdId, series, containerRef, onSuccess, onCancel }) => {
	const t = useTranslations('transactions-recurring-page.form')
	const tPaymentType = useTranslations('common.fields.payment-type')
	const tSchema = useTranslations('common.forms.transactions.create')
	const { household } = useHouseholdContext()

	const { data: categories = [] } = useQuery(getCategoriesOptions(household.id))
	const { data: bankAccounts = [] } = useQuery(getBankAccountsOptions(household.id))

	const form = useRecurringSeriesForm({ schemaParams: tSchema, series })
	const mutation = useRecurringSeriesSubmit({
		householdId,
		anchorTransactionId: series.anchorTransactionId,
		anchorDate: new Date(series.lastOccurrenceDate),
		form,
		onSuccess,
	})

	const handleSubmit = useCallback<Parameters<typeof form.handleSubmit>[0]>((data) => mutation.mutateAsync(data), [mutation])
	const { control, formState, watch } = form
	const type = watch('type')

	return (
		<FormProvider {...form}>
			<form onSubmit={form.handleSubmit(handleSubmit)} className='flex flex-1 flex-col gap-6'>
				<Controller
					name='type'
					control={control}
					render={({ field }) => (
						<Field>
							<FieldLabel>{t('type.label')}</FieldLabel>
							<div className='grid grid-cols-2 gap-2'>
								<Button
									type='button'
									variant={field.value === PAYMENT_TYPE.EXPENSE ? 'destructive' : 'outline'}
									onClick={() => field.onChange(PAYMENT_TYPE.EXPENSE)}
									disabled={formState.isSubmitting}
									className='gap-1.5'
								>
									<Icon IconComponent={TransactionTypeIcon[PAYMENT_TYPE.EXPENSE]} size='sm' className='stroke-destructive' />
									{tPaymentType('expense')}
								</Button>
								<Button
									type='button'
									variant={field.value === PAYMENT_TYPE.INCOME ? 'success' : 'outline'}
									onClick={() => field.onChange(PAYMENT_TYPE.INCOME)}
									disabled={formState.isSubmitting}
									className='gap-1.5'
								>
									<Icon IconComponent={TransactionTypeIcon[PAYMENT_TYPE.INCOME]} size='sm' className='stroke-success' />
									{tPaymentType('income')}
								</Button>
							</div>
						</Field>
					)}
				/>

				<Controller
					name='name'
					control={control}
					render={({ field, fieldState }) => (
						<Field data-invalid={!!fieldState.error}>
							<FieldLabel htmlFor={field.name} required>
								{t('name.label')}
							</FieldLabel>
							<Input {...field} disabled={formState.isSubmitting} placeholder={t('name.placeholder')} />
							{fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
						</Field>
					)}
				/>

				<div className='grid grid-cols-2 gap-4'>
					<Controller
						name='amount'
						control={control}
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
									disabled={formState.isSubmitting}
								/>
								{fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
							</Field>
						)}
					/>

					{categories.length > 0 && type !== PAYMENT_TYPE.INCOME && (
						<Controller
							name='categoryId'
							control={control}
							render={({ field }) => (
								<Field>
									<FieldLabel htmlFor={field.name}>{t('category.label')}</FieldLabel>
									<CategoryCombobox
										id={field.name}
										name={field.name}
										householdId={household.id}
										value={field.value ?? null}
										onChange={(categoryId) => field.onChange(categoryId ?? undefined)}
										disabled={formState.isSubmitting}
										container={containerRef.current}
										excludeIncomeCategory
									/>
								</Field>
							)}
						/>
					)}
				</div>

				{bankAccounts.length > 0 && (
					<Controller
						name='sourceAccountId'
						control={control}
						render={({ field }) => (
							<Field>
								<FieldLabel htmlFor={field.name}>{t('account.label')}</FieldLabel>
								<EnumDropdown
									name={field.name}
									value={field.value ?? NO_ACCOUNT_VALUE}
									onChange={(value) => field.onChange(value === NO_ACCOUNT_VALUE ? undefined : value)}
									values={[NO_ACCOUNT_VALUE, ...bankAccounts.map((account) => account.id)]}
									getLabel={(value) => {
										if (value === NO_ACCOUNT_VALUE) return t('account.none')
										const account = bankAccounts.find((a) => a.id === value)
										return account ? formatBankAccountLabel(account) : ''
									}}
									renderTrigger={(selectedValue) => {
										if (selectedValue === NO_ACCOUNT_VALUE) return t('account.none')
										const account = bankAccounts.find((a) => a.id === selectedValue)
										return account ? <BankAccountTrigger bankAccount={account} /> : ''
									}}
									renderOption={(optionValue) => {
										if (optionValue === NO_ACCOUNT_VALUE) return t('account.none')
										const account = bankAccounts.find((a) => a.id === optionValue)
										return account ? <BankAccountOption bankAccount={account} /> : ''
									}}
									disabled={formState.isSubmitting}
									container={containerRef.current}
									modal={false}
								/>
							</Field>
						)}
					/>
				)}

				<Controller
					name='note'
					control={control}
					render={({ field, fieldState }) => (
						<Field data-invalid={!!fieldState.error}>
							<FieldLabel htmlFor={field.name}>{t('note.label')}</FieldLabel>
							<Textarea {...field} value={field.value ?? ''} disabled={formState.isSubmitting} placeholder={t('note.placeholder')} />
							{fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
						</Field>
					)}
				/>

				<Controller
					name='recurrenceRule'
					control={control}
					render={({ field }) => (
						<Field data-invalid={!!formState.errors.recurrenceRule}>
							<FieldLabel>{t('recurrence.label')}</FieldLabel>
							<RecurrencePicker
								value={field.value}
								onChange={field.onChange}
								disabled={formState.isSubmitting}
								container={containerRef.current}
							/>
							{formState.errors.recurrenceRule && (
								<FieldError>
									{formState.errors.recurrenceRule.frequency?.message ??
										formState.errors.recurrenceRule.endDate?.message ??
										formState.errors.recurrenceRule.interval?.message ??
										formState.errors.recurrenceRule.occurrences?.message}
								</FieldError>
							)}
						</Field>
					)}
				/>

				{formState.errors.root && <FieldError>{formState.errors.root.message}</FieldError>}

				<div className='mt-auto flex gap-2'>
					<Button type='button' variant='outline' className='flex-1' onClick={onCancel} disabled={formState.isSubmitting}>
						{t('cancel-button')}
					</Button>
					<Button type='submit' className='flex-1' disabled={!formState.isValid} loading={formState.isSubmitting}>
						{t('submit-button')}
					</Button>
				</div>
			</form>
		</FormProvider>
	)
}
