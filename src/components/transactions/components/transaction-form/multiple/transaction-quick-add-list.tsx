'use client'

import type { FC } from 'react'

import { useTranslations } from 'next-intl'

import { Skeleton } from '@atoms/skeleton'
import { useQuery } from '@tanstack/react-query'
import { getTransactionsOptions } from '@transactions/hooks/queries/get-transactions-option'

import { TransactionQuickAddInputRow } from './transaction-quick-add-input-row'
import { TransactionQuickAddRow } from './transaction-quick-add-row'
import { QUICK_ADD_ROW_GRID_CLASS } from './transaction-quick-add.utils'

interface TransactionQuickAddListProps {
	householdId: string
	monthlyBudgetId: string
	monthlyBudgetMonth: Date
}

/** Quick add mode (Quick add ON): a live list of already-saved transactions with an always-at-the-bottom input row. */
export const TransactionQuickAddList: FC<TransactionQuickAddListProps> = ({ householdId, monthlyBudgetId, monthlyBudgetMonth }) => {
	const tForm = useTranslations('transactions-personal-page.form')
	const t = useTranslations('transactions-personal-page.form.multiple')
	const { data: transactions, isLoading } = useQuery(getTransactionsOptions(householdId, monthlyBudgetId))

	const orderedTransactions = [...(transactions ?? [])].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())

	return (
		<div className='flex flex-1 flex-col gap-1 overflow-y-auto'>
			<div className={`${QUICK_ADD_ROW_GRID_CLASS} px-2 text-xs font-medium text-muted-foreground`}>
				<span>{tForm('type.label')}</span>
				<span>{t('columns.name')}</span>
				<span>{t('columns.amount')}</span>
				<span>{t('columns.category')}</span>
				<span>{t('columns.account')}</span>
				<span>{t('columns.date')}</span>
				<span />
				<span />
			</div>

			{isLoading ? (
				<div className='flex flex-col gap-2'>
					<Skeleton className='h-9 rounded-md' />
					<Skeleton className='h-9 rounded-md' />
				</div>
			) : orderedTransactions.length === 0 ? (
				<p className='px-2 py-1 text-sm text-muted-foreground'>{t('quick-add-list.empty')}</p>
			) : (
				orderedTransactions.map((transaction) => (
					<TransactionQuickAddRow key={transaction.id} transaction={transaction} monthlyBudgetMonth={monthlyBudgetMonth} />
				))
			)}

			<TransactionQuickAddInputRow monthlyBudgetId={monthlyBudgetId} monthlyBudgetMonth={monthlyBudgetMonth} />
		</div>
	)
}
