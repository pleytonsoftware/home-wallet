import type { FC } from 'react'

import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { useFormatter, useTranslations } from 'next-intl'

import { Button } from '@atoms/button'
import { Icon } from '@atoms/icon'

interface MonthNavigatorProps {
	monthDate: Date
	onPrevious: () => void
	onNext: () => void
}

/** Calendar-style "‹ Month Year ›" navigator — used as the monthly detail page's title. */
export const MonthNavigator: FC<MonthNavigatorProps> = ({ monthDate, onPrevious, onNext }) => {
	const t = useTranslations('monthly-budget-page.summary')
	const format = useFormatter()

	return (
		<div className='flex items-center gap-1'>
			<Button variant='ghost' size='icon-sm' onClick={onPrevious} aria-label={t('previous')}>
				<Icon IconComponent={ChevronLeftIcon} size='sm' />
			</Button>
			<span className='first-letter:uppercase'>{format.dateTime(monthDate, { month: 'long', year: 'numeric' })}</span>
			<Button variant='ghost' size='icon-sm' onClick={onNext} aria-label={t('next')}>
				<Icon IconComponent={ChevronRightIcon} size='sm' />
			</Button>
		</div>
	)
}
