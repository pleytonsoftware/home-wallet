import type { FC } from 'react'

import { formatCurrency } from '@households/utils'

interface HouseholdCardStatsProps {
	text: string
	amount: number
	currency?: string
	locale?: string
}

export const HouseholdCardStats: FC<HouseholdCardStatsProps> = ({ amount, currency, locale, text }) => (
	<div className='rounded-lg bg-muted/60 p-2.5'>
		<p className='text-xs text-muted-foreground'>{text}</p>
		<p className='truncate text-sm font-semibold'>{formatCurrency(amount, currency, locale)}</p>
	</div>
)
