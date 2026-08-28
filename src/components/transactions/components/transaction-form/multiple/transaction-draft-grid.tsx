'use client'

import type { FC } from 'react'

import { useState } from 'react'

import { useTranslations } from 'next-intl'
import { FormProvider, useFieldArray, useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useHouseholdContext } from '@households/context/household.context'
import { createTransactionsBatchSchema, type CreateTransactionsBatchInput } from '@lib/schemas/transaction/create-transactions-batch'
import { getDefaultTransactionDate } from '@lib/utils/monthly-budget.utils'

import { TransactionDraftFooter } from './transaction-draft-footer'
import { TransactionDraftRow } from './transaction-draft-row'
import { DRAFT_ROW_GRID_CLASS, makeEmptyDraftRow } from './transaction-draft.utils'
import { useTransactionDraftPersistence } from './use-transaction-draft-persistence.hook'
import { useTransactionDraftSubmit } from './use-transaction-draft-submit.hook'

interface TransactionDraftGridProps {
	monthlyBudgetId: string
	monthlyBudgetMonth: Date
	onSuccess: () => void
}

/** Draft mode (Quick add OFF): rows are always editable, autosaved to localStorage, "Save all" batches them atomically. */
export const TransactionDraftGrid: FC<TransactionDraftGridProps> = ({ monthlyBudgetId, monthlyBudgetMonth, onSuccess }) => {
	const t = useTranslations('transactions-personal-page.form')
	const tSchema = useTranslations('common.forms.transactions.create')
	const { household } = useHouseholdContext()
	const defaultDate = getDefaultTransactionDate(monthlyBudgetMonth)

	const form = useForm<CreateTransactionsBatchInput>({
		resolver: zodResolver(createTransactionsBatchSchema(tSchema)),
		mode: 'onChange',
		defaultValues: { rows: [makeEmptyDraftRow(defaultDate)] },
	})
	const fieldArray = useFieldArray({ control: form.control, name: 'rows' })
	const [autosaveEnabled, setAutosaveEnabled] = useState(true)

	const { autosaveStatus, clearDraft } = useTransactionDraftPersistence({ monthlyBudgetId, form, defaultDate, autosaveEnabled })
	const mutation = useTransactionDraftSubmit({
		householdId: household.id,
		monthlyBudgetId,
		form,
		defaultDate,
		clearDraft,
		onSuccess,
	})

	const handleAddRow = () => {
		const newIndex = fieldArray.fields.length
		fieldArray.append(makeEmptyDraftRow(defaultDate))
		requestAnimationFrame(() => form.setFocus(`rows.${newIndex}.name`))
	}

	const handleDiscardRow = (index: number) => {
		if (index === fieldArray.fields.length - 1) form.setValue(`rows.${index}`, makeEmptyDraftRow(defaultDate))
		else fieldArray.remove(index)
	}

	const handleClearDraft = () => {
		form.reset({ rows: [makeEmptyDraftRow(defaultDate)] })
		clearDraft()
	}

	const rows = form.watch('rows')

	return (
		<FormProvider {...form}>
			<form
				onSubmit={form.handleSubmit((data) => mutation.mutateAsync(data))}
				onKeyDown={(event) => {
					if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
						event.preventDefault()
						event.currentTarget.requestSubmit()
					}
				}}
				className='flex flex-1 flex-col gap-3 overflow-hidden'
			>
				<div className={`${DRAFT_ROW_GRID_CLASS} px-2 text-xs font-medium text-muted-foreground`}>
					<span>{t('type.label')}</span>
					<span>{t('multiple.columns.name')}</span>
					<span>{t('multiple.columns.amount')}</span>
					<span>{t('multiple.columns.category')}</span>
					<span>{t('multiple.columns.account')}</span>
					<span>{t('multiple.columns.date')}</span>
					<span />
					<span />
				</div>

				<div className='flex flex-col gap-1 overflow-y-auto'>
					{fieldArray.fields.map((field, index) => (
						<TransactionDraftRow
							key={field.id}
							index={index}
							monthlyBudgetMonth={monthlyBudgetMonth}
							isLastRow={index === fieldArray.fields.length - 1}
							onAddRow={handleAddRow}
							onDiscardRow={handleDiscardRow}
						/>
					))}
				</div>

				{form.formState.errors.root && <p className='text-sm text-destructive'>{form.formState.errors.root.message}</p>}

				<TransactionDraftFooter
					rows={rows}
					autosaveStatus={autosaveStatus}
					autosaveEnabled={autosaveEnabled}
					onAutosaveEnabledChange={setAutosaveEnabled}
					isSubmitting={mutation.isPending}
					onAddRow={handleAddRow}
					onClearDraft={handleClearDraft}
				/>
			</form>
		</FormProvider>
	)
}
