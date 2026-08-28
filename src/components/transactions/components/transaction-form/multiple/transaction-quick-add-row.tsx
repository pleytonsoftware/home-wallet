'use client'

import type { TransactionSummary } from '@transactions/types'
import type { FC } from 'react'

import { useState } from 'react'

import { ArrowDownLeftIcon, ArrowUpRightIcon, CheckIcon, MoreHorizontalIcon, RepeatIcon, XIcon } from 'lucide-react'
import { useFormatter, useTranslations } from 'next-intl'
import { Controller, FormProvider, useWatch } from 'react-hook-form'
import { toast } from 'sonner'

import { Button } from '@atoms/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@atoms/dropdown-menu'
import { Icon } from '@atoms/icon'
import { Input } from '@atoms/input'
import { CategoryBadge } from '@categories/components/category-badge'
import { useCategoryDisplayName } from '@categories/hooks/use-category-display-name.hook'
import { useHouseholdContext } from '@households/context/household.context'
import { formatCurrency } from '@households/utils'
import { PAYMENT_TYPE } from '@lib/constants/payment.enum'
import { lastDayOfMonthUtc } from '@lib/utils/monthly-budget.utils'
import { CurrencyInput } from '@molecules/currency-input'
import { MONTHLY_BUDGETS_QUERY_KEYS } from '@monthly-budgets/constants/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useTransactionFormContainer } from '@transactions/components/transaction-form/transaction-form.context'
import { TRANSACTIONS_QUERY_KEYS } from '@transactions/constants/query-keys'
import { useTransactionForm } from '@transactions/hooks/forms/use-transaction-form.hook'
import { deleteTransactionMutationOptions } from '@transactions/hooks/mutations/delete-transaction.hook'
import { updateTransactionMutationOptions } from '@transactions/hooks/mutations/update-transaction.hook'

import { QUICK_ADD_ROW_GRID_CLASS } from './transaction-quick-add.utils'
import { TransactionRowAccountCell } from './transaction-row-account-cell'
import { TransactionRowCategoryCell } from './transaction-row-category-cell'
import { TransactionRowDateCell } from './transaction-row-date-cell'
import { TransactionRowRecurrenceCell } from './transaction-row-recurrence-cell'
import { TransactionRowTypeCell } from './transaction-row-type-cell'

interface TransactionQuickAddRowProps {
	transaction: TransactionSummary
	monthlyBudgetMonth: Date
}

/** One already-saved transaction — a plain display row that flips into an in-place edit form and back. */
export const TransactionQuickAddRow: FC<TransactionQuickAddRowProps> = ({ transaction, monthlyBudgetMonth }) => {
	const [isEditing, setIsEditing] = useState(false)

	return isEditing ? (
		<TransactionQuickAddRowEdit transaction={transaction} monthlyBudgetMonth={monthlyBudgetMonth} onDone={() => setIsEditing(false)} />
	) : (
		<TransactionQuickAddRowDisplay transaction={transaction} onEdit={() => setIsEditing(true)} />
	)
}

const TransactionQuickAddRowDisplay: FC<{ transaction: TransactionSummary; onEdit: () => void }> = ({ transaction, onEdit }) => {
	const t = useTranslations('transactions-personal-page.form.multiple.quick-add-list')
	const format = useFormatter()
	const { household } = useHouseholdContext()
	const getCategoryDisplayName = useCategoryDisplayName()
	const queryClient = useQueryClient()
	const containerRef = useTransactionFormContainer()
	const isIncome = transaction.type === PAYMENT_TYPE.INCOME

	const deleteMutation = useMutation({
		...deleteTransactionMutationOptions(transaction.id),
		onSuccess: async (res) => {
			if (!res.success) {
				toast.error(typeof res.error === 'string' ? res.error : t('remove'))
				return
			}
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEYS.transactions(household.id, transaction.monthlyBudgetId) }),
				queryClient.invalidateQueries({ queryKey: MONTHLY_BUDGETS_QUERY_KEYS.all(household.id) }),
			])
		},
	})

	return (
		<div className={`${QUICK_ADD_ROW_GRID_CLASS} rounded-md px-2 py-1`}>
			<Icon
				IconComponent={isIncome ? ArrowUpRightIcon : ArrowDownLeftIcon}
				size='sm'
				className={isIncome ? 'text-success' : 'text-destructive'}
			/>
			<span className='truncate text-sm'>{transaction.name}</span>
			<span className={`text-sm font-medium ${isIncome ? 'text-success' : 'text-destructive'}`}>
				{isIncome ? '+' : '-'}
				{formatCurrency(transaction.amount, household.config.currency)}
			</span>
			{transaction.category ? (
				<CategoryBadge
					name={getCategoryDisplayName(transaction.category)}
					color={transaction.category.color}
					icon={transaction.category.icon}
				/>
			) : (
				<span className='text-sm text-muted-foreground'>—</span>
			)}
			<span className='truncate text-sm text-muted-foreground'>{transaction.sourceAccount ? transaction.sourceAccount.name : '—'}</span>
			<span className='text-sm text-muted-foreground'>{format.dateTime(new Date(transaction.date), { dateStyle: 'medium' })}</span>
			<span className='flex justify-center'>
				{transaction.isRecurring && <Icon IconComponent={RepeatIcon} size='xs' className='text-muted-foreground' />}
			</span>

			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button type='button' variant='ghost' size='icon-sm' aria-label={t('edit')}>
						<Icon IconComponent={MoreHorizontalIcon} size='sm' />
					</Button>
				</DropdownMenuTrigger>
				{/* eslint-disable-next-line react-hooks/refs -- `container` is only consulted when the menu actually opens (a later render, well after the sheet's container ref has attached); same `containerRef.current`-in-render pattern already used unflagged by TransactionRowCategoryCell/TransactionRowAccountCell and Single mode's own field components. */}
				<DropdownMenuContent align='end' container={containerRef.current}>
					<DropdownMenuItem onClick={onEdit}>{t('edit')}</DropdownMenuItem>
					<DropdownMenuItem variant='destructive' onClick={() => deleteMutation.mutate()}>
						{t('remove')}
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	)
}

const TransactionQuickAddRowEdit: FC<{ transaction: TransactionSummary; monthlyBudgetMonth: Date; onDone: () => void }> = ({
	transaction,
	monthlyBudgetMonth,
	onDone,
}) => {
	const t = useTranslations('transactions-personal-page.form')
	const tQuickAdd = useTranslations('transactions-personal-page.form.multiple.quick-add-list')
	const tSchema = useTranslations('common.forms.transactions.create')
	const { household } = useHouseholdContext()
	const queryClient = useQueryClient()

	const form = useTransactionForm({
		mode: 'edit',
		schemaParams: tSchema,
		initialData: transaction,
		defaultDate: new Date(transaction.date),
	})
	const mutation = useMutation(updateTransactionMutationOptions(transaction.id))
	const disabled = form.formState.isSubmitting
	const type = useWatch({ control: form.control, name: 'type' })

	const handleAccept = form.handleSubmit(async (data) => {
		const res = await mutation.mutateAsync(data)
		if (!res.success) {
			toast.error(typeof res.error === 'string' ? res.error : t('error'))
			return
		}
		await Promise.all([
			queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEYS.transactions(household.id, transaction.monthlyBudgetId) }),
			queryClient.invalidateQueries({ queryKey: MONTHLY_BUDGETS_QUERY_KEYS.all(household.id) }),
		])
		toast.success(t('saved'))
		onDone()
	})

	return (
		<FormProvider {...form}>
			<div className={`${QUICK_ADD_ROW_GRID_CLASS} rounded-md border border-input px-2 py-1`}>
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

				<div className='flex items-center gap-1'>
					<Button type='button' size='icon-sm' aria-label={tQuickAdd('accept')} onClick={handleAccept} loading={disabled}>
						<Icon IconComponent={CheckIcon} size='sm' />
					</Button>
					<Button type='button' variant='outline' size='icon-sm' aria-label={tQuickAdd('reject')} onClick={onDone} disabled={disabled}>
						<Icon IconComponent={XIcon} size='sm' />
					</Button>
				</div>
			</div>
		</FormProvider>
	)
}
