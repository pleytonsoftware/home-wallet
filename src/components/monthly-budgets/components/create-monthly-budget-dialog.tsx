'use client'

import type { FC } from 'react'

import { useCallback } from 'react'

import { useFormatter, useTranslations } from 'next-intl'
import { Controller } from 'react-hook-form'

import { Button } from '@atoms/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@atoms/dialog'
import { Field, FieldDescription, FieldError, FieldLabel } from '@atoms/field'
import { useHouseholdContext } from '@households/context/household.context'
import { parseMonthParam } from '@lib/utils/monthly-budget.utils'
import { CurrencyInput } from '@molecules/currency-input'
import { useCreateMonthlyBudgetForm } from '@monthly-budgets/hooks/forms/use-create-monthly-budget-form.hook'
import { useCreateMonthlyBudgetSubmit } from '@monthly-budgets/hooks/forms/use-create-monthly-budget-submit.hook'

interface CreateMonthlyBudgetDialogProps {
	month: string
	open: boolean
	onOpenChange: (open: boolean) => void
	onCreated: (month: string) => void
}

export const CreateMonthlyBudgetDialog: FC<CreateMonthlyBudgetDialogProps> = ({ month, open, onOpenChange, onCreated }) => {
	const t = useTranslations('monthly-budget-page.form')
	const tSchema = useTranslations('common.forms.monthly-budgets.create')
	const format = useFormatter()
	const { household } = useHouseholdContext()

	const form = useCreateMonthlyBudgetForm({ month, schemaParams: tSchema })
	const mutation = useCreateMonthlyBudgetSubmit({
		householdId: household.id,
		form,
		onSuccess: () => {
			onOpenChange(false)
			onCreated(month)
		},
	})

	const handleSubmit = useCallback<Parameters<typeof form.handleSubmit>[0]>((data) => mutation.mutateAsync(data), [mutation])

	const monthDate = parseMonthParam(month)
	const monthLabel = monthDate ? format.dateTime(monthDate, { month: 'long', year: 'numeric', timeZone: 'UTC' }) : month

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{t('title')}</DialogTitle>
					<DialogDescription>{t('description', { month: monthLabel })}</DialogDescription>
				</DialogHeader>

				<form onSubmit={form.handleSubmit(handleSubmit)} className='flex flex-col gap-4'>
					<Controller
						name='targetAmount'
						control={form.control}
						render={({ field, fieldState }) => (
							<Field data-invalid={!!fieldState.error}>
								<FieldLabel htmlFor={field.name}>{t('target-amount.label')}</FieldLabel>
								<CurrencyInput
									name={field.name}
									value={field.value ?? ''}
									onChange={(e) => field.onChange(e.target.value === '' ? undefined : Number(e.target.value))}
									onBlur={field.onBlur}
									ref={field.ref}
									currency={household.config.currency}
									disabled={form.formState.isSubmitting}
									autoFocus
								/>
								<FieldDescription>{t('target-amount.description')}</FieldDescription>
								{fieldState.error && <FieldError>{fieldState.error.message}</FieldError>}
							</Field>
						)}
					/>

					{form.formState.errors.root && <FieldError>{form.formState.errors.root.message}</FieldError>}

					<DialogFooter>
						<Button type='submit' disabled={!form.formState.isValid} loading={form.formState.isSubmitting}>
							{t('submit-button')}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
