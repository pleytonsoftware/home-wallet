'use client'

import type { TransactionSummary } from '@transactions/types'
import type { FC } from 'react'

import { useMemo } from 'react'

import { format, isToday, isYesterday } from 'date-fns'
import { useFormatter, useTranslations } from 'next-intl'

import { cn } from '@cn'
import { useHouseholdContext } from '@households/context/household.context'
import { formatCurrency } from '@households/utils'
import { PAYMENT_TYPE } from '@lib/constants/payment.enum'
import { TransactionRow } from '@transactions/components/transaction-row'

interface DailyTimelineProps {
	transactions: Array<TransactionSummary>
	onSelect: (transaction: TransactionSummary) => void
}

interface DayGroup {
	date: Date
	transactions: Array<TransactionSummary>
	net: number
}

export const DailyTimeline: FC<DailyTimelineProps> = ({ transactions, onSelect }) => {
	const t = useTranslations('transactions-personal-page')
	const format_ = useFormatter()
	const { household } = useHouseholdContext()

	const groups = useMemo<Array<DayGroup>>(() => {
		const byDay = new Map<string, DayGroup>()

		for (const transaction of transactions) {
			const date = new Date(transaction.date)
			const key = format(date, 'yyyy-MM-dd')
			const signedAmount = transaction.type === PAYMENT_TYPE.INCOME ? transaction.amount : -transaction.amount
			const existing = byDay.get(key)

			if (existing) {
				existing.transactions.push(transaction)
				existing.net += signedAmount
			} else {
				byDay.set(key, { date, transactions: [transaction], net: signedAmount })
			}
		}

		return [...byDay.values()].sort((a, b) => b.date.getTime() - a.date.getTime())
	}, [transactions])

	if (groups.length === 0) return null

	return (
		<div className='flex flex-col gap-6'>
			{groups.map((group) => (
				<div key={group.date.toISOString()} className='flex flex-col gap-1'>
					<div className='flex items-center justify-between px-2'>
						<span className='text-sm font-medium text-muted-foreground'>
							{isToday(group.date)
								? t('timeline.today')
								: isYesterday(group.date)
									? t('timeline.yesterday')
									: format_.dateTime(group.date, { weekday: 'short', month: 'short', day: 'numeric' })}
						</span>
						<span className={cn('text-xs font-medium', group.net >= 0 ? 'text-success' : 'text-destructive')}>
							{group.net >= 0 ? '+' : '-'}
							{formatCurrency(Math.abs(group.net), household.config.currency)}
						</span>
					</div>
					<div className='flex flex-col gap-0.5 rounded-xl border bg-card p-1'>
						{group.transactions.map((transaction) => (
							<TransactionRow key={transaction.id} transaction={transaction} onSelect={onSelect} />
						))}
					</div>
				</div>
			))}
		</div>
	)
}
