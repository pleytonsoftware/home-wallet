'use client'

import type { MonthTile } from '@monthly-budgets/types'
import type { FC } from 'react'

import { useFormatter, useTranslations } from 'next-intl'

import { cn } from '@cn'
import { useHouseholdContext } from '@households/context/household.context'
import { parseMonthParam } from '@lib/utils/monthly-budget.utils'
import { MONTH_CARD_MIN_HEIGHT } from '@monthly-budgets/constants/card'

import { MonthCardDetail } from './month-card-detail'
import { StatusIcon } from './status-icon'

interface MonthCardProps {
	tile: MonthTile
	onOpen: (month: string) => void
	onCreate: (month: string) => void
}

export const MonthCard: FC<MonthCardProps> = ({ tile, onOpen, onCreate }) => {
	const t = useTranslations('monthly-budget-page.grid')
	const format = useFormatter()
	const { household } = useHouseholdContext()

	const monthDate = parseMonthParam(tile.month)
	const monthLabel = monthDate ? format.dateTime(monthDate, { month: 'short', year: 'numeric', timeZone: 'UTC' }) : tile.month

	const isInteractive = tile.status === 'created' || tile.status === 'available'
	const handleClick = () => {
		if (tile.status === 'created') onOpen(tile.month)
		if (tile.status === 'available') onCreate(tile.month)
	}

	return (
		<button
			type='button'
			disabled={!isInteractive}
			onClick={handleClick}
			className={cn(
				'flex flex-col justify-between gap-3 rounded-xl border bg-card p-3 text-left shadow-xs transition-colors',
				MONTH_CARD_MIN_HEIGHT,
				isInteractive && 'hover:border-primary/50 hover:shadow',
				tile.status === 'available' && 'border-dashed border-primary/50',
				tile.status === 'locked' && 'cursor-default opacity-70',
				tile.status === 'not-created' && 'cursor-default border-dashed opacity-50',
			)}
		>
			<div className='flex items-start justify-between gap-2'>
				<span className={cn('truncate font-semibold capitalize', tile.status === 'available' && 'text-primary')}>{monthLabel}</span>
				<StatusIcon status={tile.status} />
			</div>

			<MonthCardDetail tile={tile} t={t} currency={household.config.currency} />
		</button>
	)
}
