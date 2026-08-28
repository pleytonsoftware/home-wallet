'use client'

import type { TransactionSummary } from '@transactions/types'
import type { FC } from 'react'

import { useRouter } from '@/i18n/navigation'

import { useState } from 'react'

import { CalendarDaysIcon, PlusIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@atoms/button'
import { Icon } from '@atoms/icon'
import { useHouseholdContext } from '@households/context/household.context'
import { ROUTES } from '@lib/constants/routes.const'
import { addMonthsUtc, formatMonthParam, parseMonthParam } from '@lib/utils/monthly-budget.utils'
import { PageHeader } from '@molecules/page-header'
import { MonthNavigator } from '@monthly-budgets/components/month-navigator'
import { MonthlyBudgetDetail } from '@monthly-budgets/components/monthly-budget-detail'
import { MonthlyBudgetLocked } from '@monthly-budgets/components/monthly-budget-locked'
import { DailyTimelineSkeleton, MonthlySummaryHeaderSkeleton } from '@monthly-budgets/components/monthly-detail-skeleton'
import { getMonthlyBudgetOptions } from '@monthly-budgets/hooks/queries/get-monthly-budget-option'
import { useQuery } from '@tanstack/react-query'
import { getTransactionsOptions } from '@transactions/hooks/queries/get-transactions-option'

interface MonthlyDetailPageProps {
	month: string
}

export const MonthlyDetailPage: FC<MonthlyDetailPageProps> = ({ month }) => {
	const t = useTranslations('monthly-budget-page')
	const tTransactions = useTranslations('transactions-personal-page')
	const router = useRouter()
	const { household } = useHouseholdContext()
	const [createOpen, setCreateOpen] = useState(false)
	const [createTransactionOpen, setCreateTransactionOpen] = useState(false)
	const [selectedTransaction, setSelectedTransaction] = useState<TransactionSummary | null>(null)
	const [editingTransaction, setEditingTransaction] = useState<TransactionSummary | null>(null)

	const { data, isLoading } = useQuery(getMonthlyBudgetOptions(household.id, month))
	const monthDate = parseMonthParam(month)

	const { data: transactions = [], isPending: transactionsLoading } = useQuery({
		...getTransactionsOptions(household.id, data?.budget?.id ?? ''),
		enabled: !!data?.budget,
	})

	const navigateToMonth = (target: Date) =>
		router.push(ROUTES.HOUSEHOLD.BUDGETS.PERSONAL_MONTH.replace(':id', household.id).replace(':month', formatMonthParam(target)))

	if (!monthDate) return null

	const isAvailableMonth = data?.nextAvailableMonth === month

	return (
		<div className='mx-auto flex w-full flex-col gap-6 py-4 px-4 sm:px-0'>
			<div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
				<PageHeader
					icon={CalendarDaysIcon}
					eyebrow={t('eyebrow')}
					title={
						<MonthNavigator
							monthDate={monthDate}
							onPrevious={() => navigateToMonth(addMonthsUtc(monthDate, -1))}
							onNext={() => navigateToMonth(addMonthsUtc(monthDate, 1))}
						/>
					}
					description={t('detail-description')}
				/>
				{data?.budget && (
					<Button onClick={() => setCreateTransactionOpen(true)} className='gap-1.5'>
						<Icon IconComponent={PlusIcon} size='sm' />
						{tTransactions('add-transaction')}
					</Button>
				)}
			</div>

			{isLoading ? (
				<>
					<MonthlySummaryHeaderSkeleton />
					<DailyTimelineSkeleton />
				</>
			) : data?.budget ? (
				<MonthlyBudgetDetail
					budget={data.budget}
					monthDate={monthDate}
					householdId={household.id}
					transactions={transactions}
					transactionsLoading={transactionsLoading}
					selectedTransaction={selectedTransaction}
					onSelectTransaction={setSelectedTransaction}
					editingTransaction={editingTransaction}
					onEditTransaction={setEditingTransaction}
					createTransactionOpen={createTransactionOpen}
					onCreateTransactionOpenChange={setCreateTransactionOpen}
				/>
			) : (
				<MonthlyBudgetLocked
					month={month}
					isAvailableMonth={isAvailableMonth}
					createOpen={createOpen}
					onCreateOpenChange={setCreateOpen}
					onCreated={() => navigateToMonth(monthDate)}
					onBack={() => router.push(ROUTES.HOUSEHOLD.BUDGETS.PERSONAL.replace(':id', household.id))}
				/>
			)}
		</div>
	)
}
