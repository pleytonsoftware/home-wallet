'use client'

import type { MonthlyBudgetSummary } from '@monthly-budgets/types'
import type { TransactionSummary } from '@transactions/types'
import type { FC } from 'react'

import { PlusIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { StatusScreen } from '@molecules/status-screen'
import { DailyTimelineSkeleton } from '@monthly-budgets/components/monthly-detail-skeleton'
import { MonthlySummaryHeader } from '@monthly-budgets/components/monthly-summary-header'
import { DailyTimeline } from '@transactions/components/daily-timeline'
import { TransactionDetailSheet } from '@transactions/components/transaction-detail-sheet'
import { TransactionFormModal } from '@transactions/components/transaction-form/transaction-form-modal'

interface MonthlyBudgetDetailProps {
	budget: MonthlyBudgetSummary
	monthDate: Date
	householdId: string
	transactions: Array<TransactionSummary>
	transactionsLoading: boolean
	selectedTransaction: TransactionSummary | null
	onSelectTransaction: (transaction: TransactionSummary | null) => void
	editingTransaction: TransactionSummary | null
	onEditTransaction: (transaction: TransactionSummary | null) => void
	createTransactionOpen: boolean
	onCreateTransactionOpenChange: (open: boolean) => void
}

/** The monthly detail page's "budget exists" content — stats, the daily timeline, and every transaction sheet/modal it owns. */
export const MonthlyBudgetDetail: FC<MonthlyBudgetDetailProps> = ({
	budget,
	monthDate,
	householdId,
	transactions,
	transactionsLoading,
	selectedTransaction,
	onSelectTransaction,
	editingTransaction,
	onEditTransaction,
	createTransactionOpen,
	onCreateTransactionOpenChange,
}) => {
	const tTransactions = useTranslations('transactions-personal-page')

	return (
		<>
			<MonthlySummaryHeader budget={budget} />

			{transactionsLoading ? (
				<DailyTimelineSkeleton />
			) : transactions.length > 0 ? (
				<DailyTimeline transactions={transactions} onSelect={onSelectTransaction} />
			) : (
				<StatusScreen
					variant='panel'
					icon={PlusIcon}
					title={tTransactions('empty-state.title')}
					description={tTransactions('empty-state.description')}
				/>
			)}

			<TransactionFormModal
				mode='create'
				monthlyBudgetId={budget.id}
				monthlyBudgetMonth={monthDate}
				open={createTransactionOpen}
				onOpenChange={onCreateTransactionOpenChange}
			/>

			<TransactionDetailSheet
				transaction={selectedTransaction}
				householdId={householdId}
				onOpenChange={(open) => !open && onSelectTransaction(null)}
				onEdit={(transaction) => {
					onSelectTransaction(null)
					onEditTransaction(transaction)
				}}
			/>

			{editingTransaction && (
				<TransactionFormModal
					mode='edit'
					transaction={editingTransaction}
					monthlyBudgetId={budget.id}
					monthlyBudgetMonth={monthDate}
					open={!!editingTransaction}
					onOpenChange={(open) => !open && onEditTransaction(null)}
				/>
			)}
		</>
	)
}
