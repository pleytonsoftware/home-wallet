'use client'

import type { FC, KeyboardEvent } from 'react'

import { useRef } from 'react'

import { Trash2Icon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Controller, useFormContext, useWatch } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@atoms/button'
import { Icon } from '@atoms/icon'
import { Input } from '@atoms/input'
import { cn } from '@cn'
import { useHouseholdContext } from '@households/context/household.context'
import { isEventFromFloatingContent, isLastFocusable } from '@lib/utils/dom-focus.utils'
import { lastDayOfMonthUtc } from '@lib/utils/monthly-budget.utils'
import { CurrencyInput } from '@molecules/currency-input'

import { DRAFT_ROW_GRID_CLASS } from './transaction-draft.utils'
import { TransactionRowAccountCell } from './transaction-row-account-cell'
import { TransactionRowCategoryCell } from './transaction-row-category-cell'
import { TransactionRowDateCell } from './transaction-row-date-cell'
import { TransactionRowRecurrenceCell } from './transaction-row-recurrence-cell'
import { TransactionRowTypeCell } from './transaction-row-type-cell'

const DISCARD_CONFIRM_WINDOW_MS = 3000

interface TransactionDraftRowProps {
	index: number
	monthlyBudgetMonth: Date
	isLastRow: boolean
	onAddRow: () => void
	onDiscardRow: (index: number) => void
}

export const TransactionDraftRow: FC<TransactionDraftRowProps> = ({ index, monthlyBudgetMonth, isLastRow, onAddRow, onDiscardRow }) => {
	const t = useTranslations('transactions-personal-page.form')
	const tMultiple = useTranslations('transactions-personal-page.form.multiple')
	const { household } = useHouseholdContext()
	const { control, register, formState } = useFormContext()
	const rowRef = useRef<HTMLDivElement>(null)
	const pendingDiscard = useRef(false)
	const discardTimeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)

	// eslint-disable-next-line @typescript-eslint/no-explicit-any -- `useFormContext()` is untyped here so shared cells can serve both a standalone row form and this field array; narrowing `errors.rows` to an indexable array needs a local cast.
	const rowErrors = (formState.errors.rows as any)?.[index]
	const disabled = formState.isSubmitting
	const type = useWatch({ control, name: `rows.${index}.type` })

	const discardRow = () => {
		clearTimeout(discardTimeoutRef.current)
		pendingDiscard.current = false
		onDiscardRow(index)
		toast.success(tMultiple('row-cleared'))
	}

	const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
		// A nested combobox/popover/dropdown (Category, Account, Date, Recurrence) may not call
		// `preventDefault()` on the keys it handles itself (e.g. Enter to pick an item) — since React's
		// synthetic events still bubble here even though those popups are portalled elsewhere in the
		// DOM, treat any key origin inside one of them as "not this row's shortcut" to act on.
		if (isEventFromFloatingContent(event.target)) return

		if (event.key === 'Enter' && !event.metaKey && !event.ctrlKey && !event.defaultPrevented) {
			event.preventDefault()
			if (isLastRow) onAddRow()
			return
		}

		if (event.key === 'Tab' && !event.shiftKey && isLastRow && rowRef.current && isLastFocusable(rowRef.current, document.activeElement)) {
			event.preventDefault()
			onAddRow()
			return
		}

		if (event.key === 'Escape') {
			event.preventDefault()
			if (!pendingDiscard.current) {
				pendingDiscard.current = true
				toast(tMultiple('clear-row-confirm'))
				discardTimeoutRef.current = setTimeout(() => {
					pendingDiscard.current = false
				}, DISCARD_CONFIRM_WINDOW_MS)
				return
			}

			discardRow()
		}
	}

	return (
		<div ref={rowRef} className={cn(DRAFT_ROW_GRID_CLASS, 'rounded-md px-2 py-1')} onKeyDown={handleKeyDown}>
			<TransactionRowTypeCell name={`rows.${index}.type`} disabled={disabled} />
			<Input
				{...register(`rows.${index}.name`)}
				placeholder={t('name.placeholder')}
				disabled={disabled}
				className={cn(rowErrors?.name && 'border-destructive')}
			/>
			<Controller
				name={`rows.${index}.amount`}
				control={control}
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
						className={cn(rowErrors?.amount && 'border-destructive')}
					/>
				)}
			/>
			<TransactionRowCategoryCell
				name={`rows.${index}.categoryId`}
				typeName={`rows.${index}.type`}
				householdId={household.id}
				disabled={disabled}
				rowRef={rowRef}
			/>
			<TransactionRowAccountCell name={`rows.${index}.sourceAccountId`} householdId={household.id} disabled={disabled} />
			<TransactionRowDateCell
				name={`rows.${index}.date`}
				disabled={disabled}
				fromDate={monthlyBudgetMonth}
				toDate={lastDayOfMonthUtc(monthlyBudgetMonth)}
			/>
			<TransactionRowRecurrenceCell
				isRecurringName={`rows.${index}.isRecurring`}
				recurrenceRuleName={`rows.${index}.recurrenceRule`}
				disabled={disabled}
			/>
			<Button
				type='button'
				variant='ghost'
				size='icon-sm'
				aria-label={tMultiple('clear-row')}
				disabled={disabled || isLastRow}
				onClick={discardRow}
			>
				<Icon IconComponent={Trash2Icon} size='sm' className='text-muted-foreground' />
			</Button>
		</div>
	)
}
