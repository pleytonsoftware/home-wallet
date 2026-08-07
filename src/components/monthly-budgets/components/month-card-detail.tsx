import type { MonthTile } from '@monthly-budgets/types'
import type { useTranslations } from 'next-intl'
import type { FC } from 'react'

import { formatCurrency } from '@households/utils'

interface MonthCardDetailProps {
	tile: MonthTile
	t: ReturnType<typeof useTranslations<'monthly-budget-page.grid'>>
	currency: string
}

export const MonthCardDetail: FC<MonthCardDetailProps> = ({ tile, t, currency }) => {
	if (tile.status === 'created' && tile.budget) {
		const { targetAmount } = tile.budget
		return <span className='text-sm text-muted-foreground'>{targetAmount != null ? formatCurrency(targetAmount, currency) : t('no-target')}</span>
	}

	if (tile.status === 'available') {
		return <span className='text-sm font-medium text-primary'>{t('available')}</span>
	}

	if (tile.status === 'locked') {
		return <span className='text-sm text-muted-foreground'>{t('locked')}</span>
	}

	return <span className='text-sm text-muted-foreground'>{t('not-created')}</span>
}
