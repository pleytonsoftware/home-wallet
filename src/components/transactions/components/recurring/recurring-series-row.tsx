'use client'

import type { RecurringSeriesSummary } from '@transactions/types'
import type { FC } from 'react'

import { ChevronRightIcon, TagIcon } from 'lucide-react'
import { useFormatter, useTranslations } from 'next-intl'

import { Icon } from '@atoms/icon'
import { CATEGORY_COLOR_CLASSES } from '@categories/constants/colors'
import { CATEGORY_ICON_COMPONENTS } from '@categories/constants/icons'
import { useCategoryDisplayName } from '@categories/hooks/use-category-display-name.hook'
import { cn } from '@cn'
import { useHouseholdContext } from '@households/context/household.context'
import { formatCurrency } from '@households/utils'
import { PAYMENT_TYPE } from '@lib/constants/payment.enum'

interface RecurringSeriesRowProps {
	series: RecurringSeriesSummary
	onSelect: (series: RecurringSeriesSummary) => void
}

export const RecurringSeriesRow: FC<RecurringSeriesRowProps> = ({ series, onSelect }) => {
	const t = useTranslations('transactions-recurring-page')
	const tFrequency = useTranslations('common.fields.recurrence-frequency')
	const format = useFormatter()
	const { household } = useHouseholdContext()
	const getCategoryDisplayName = useCategoryDisplayName()

	const isIncome = series.type === PAYMENT_TYPE.INCOME
	const colorClasses = series.category ? CATEGORY_COLOR_CLASSES[series.category.color] : null
	const categoryIcon = series.category ? CATEGORY_ICON_COMPONENTS[series.category.icon] : null

	const metadata =
		series.status === 'active' && series.nextOccurrenceDate
			? t('row.next-due', {
					frequency: tFrequency(series.frequency),
					date: format.dateTime(new Date(series.nextOccurrenceDate), { dateStyle: 'medium' }),
				})
			: t('row.ended-on', { date: format.dateTime(new Date(series.lastOccurrenceDate), { dateStyle: 'medium' }) })

	return (
		<button
			type='button'
			onClick={() => onSelect(series)}
			className='flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted/60'
		>
			<span
				className={cn(
					'flex size-9 shrink-0 items-center justify-center rounded-full',
					colorClasses?.badge ?? 'bg-muted text-muted-foreground',
				)}
			>
				<Icon IconComponent={categoryIcon ?? TagIcon} size='sm' />
			</span>

			<span className='min-w-0 flex-1'>
				<span className='block truncate font-medium'>{series.name}</span>
				<span className='block truncate text-xs text-muted-foreground'>
					{series.category && `${getCategoryDisplayName(series.category)} · `}
					{metadata}
				</span>
			</span>

			<span className={cn('shrink-0 font-semibold', isIncome ? 'text-success' : 'text-destructive')}>
				{isIncome ? '+' : '-'}
				{formatCurrency(series.amount, household.config.currency)}
			</span>

			<Icon IconComponent={ChevronRightIcon} size='sm' className='shrink-0 text-muted-foreground' />
		</button>
	)
}
