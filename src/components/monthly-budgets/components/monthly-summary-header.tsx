import type { MonthlyBudgetSummary } from '@monthly-budgets/types'
import type { FC } from 'react'

import { useTranslations } from 'next-intl'

import { cn } from '@cn'
import { useHouseholdContext } from '@households/context/household.context'
import { formatCurrency } from '@households/utils'
import { CircularProgress } from '@molecules/circular-progress'

interface MonthlySummaryHeaderProps {
	budget: MonthlyBudgetSummary
}

export const MonthlySummaryHeader: FC<MonthlySummaryHeaderProps> = ({ budget }) => {
	const t = useTranslations('monthly-budget-page.summary')
	const { household } = useHouseholdContext()
	const currency = household.config.currency
	const hasTarget = budget.targetAmount != null && budget.targetAmount > 0
	const usedPercent = hasTarget ? Math.round((budget.totals.expenses / budget.targetAmount!) * 100) : 0

	return (
		<div className='flex flex-col gap-4 rounded-2xl border bg-card p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between'>
			<div className='grid flex-1 grid-cols-2 gap-4 sm:grid-cols-4'>
				<Stat label={t('income')} value={formatCurrency(budget.totals.income, currency)} className='text-success' />
				<Stat label={t('expenses')} value={formatCurrency(budget.totals.expenses, currency)} className='text-destructive' />
				<Stat label={t('savings')} value={formatCurrency(budget.totals.savings, currency)} />
				<Stat label={t('budget')} value={hasTarget ? formatCurrency(budget.targetAmount!, currency) : t('no-target')} />
			</div>

			<CircularProgress value={usedPercent} size={64}>
				<span className='text-xs font-semibold'>{hasTarget ? `${usedPercent}%` : '—'}</span>
			</CircularProgress>
		</div>
	)
}

interface StateProps {
	label: string
	value: string
	className?: string
}

const Stat: FC<StateProps> = ({ label, value, className }) => (
	<div>
		<p className='text-xs text-muted-foreground'>{label}</p>
		<p className={cn('font-semibold', className)}>{value}</p>
	</div>
)
