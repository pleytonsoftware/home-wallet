'use client'

import type { MonthTile } from '@monthly-budgets/types'
import type { FC } from 'react'

import { ChevronRightIcon, LockIcon, PlusIcon } from 'lucide-react'
import { useFormatter } from 'next-intl'

import { Icon } from '@atoms/icon'
import { cn } from '@cn'
import { useHouseholdContext } from '@households/context/household.context'
import { formatCurrency } from '@households/utils'
import { parseMonthParam } from '@lib/utils/monthly-budget.utils'

interface MonthListRowProps {
	tile: MonthTile
	onOpen: (month: string) => void
	onCreate: (month: string) => void
}

export const MonthListRow: FC<MonthListRowProps> = ({ tile, onOpen, onCreate }) => {
	const format = useFormatter()
	const { household } = useHouseholdContext()

	const monthDate = parseMonthParam(tile.month)
	const monthLabel = monthDate ? format.dateTime(monthDate, { month: 'long', year: 'numeric', timeZone: 'UTC' }) : tile.month
	const isInteractive = tile.status === 'created' || tile.status === 'available'

	const handleClick = () => {
		if (tile.status === 'created') onOpen(tile.month)
		if (tile.status === 'available') onCreate(tile.month)
	}

	return (
		<li>
			<button
				type='button'
				disabled={!isInteractive}
				onClick={handleClick}
				className={cn(
					'flex w-full items-center justify-between gap-3 rounded-lg border border-transparent bg-muted/40 px-3 py-2.5 text-left transition-colors',
					isInteractive ? 'hover:border-primary/50 hover:bg-muted/60' : 'opacity-50',
				)}
			>
				<span className='truncate font-medium capitalize'>{monthLabel}</span>
				<span className='flex shrink-0 items-center gap-2'>
					{tile.status === 'created' && tile.budget?.targetAmount != null && (
						<span className='text-sm text-muted-foreground'>{formatCurrency(tile.budget.targetAmount, household.config.currency)}</span>
					)}
					{tile.status === 'available' && <Icon IconComponent={PlusIcon} size='sm' className='text-primary' />}
					{tile.status === 'locked' && <Icon IconComponent={LockIcon} size='sm' className='text-muted-foreground' />}
					{tile.status === 'created' && <Icon IconComponent={ChevronRightIcon} size='sm' className='text-muted-foreground' />}
				</span>
			</button>
		</li>
	)
}
