'use client'

import type { FC } from 'react'

import { CalendarDaysIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@atoms/button'
import { StatusScreen } from '@molecules/status-screen'
import { CreateMonthlyBudgetDialog } from '@monthly-budgets/components/create-monthly-budget-dialog'

interface MonthlyBudgetLockedProps {
	month: string
	isAvailableMonth: boolean
	createOpen: boolean
	onCreateOpenChange: (open: boolean) => void
	onCreated: () => void
	onBack: () => void
}

/** The monthly detail page's "no budget yet" content — locked/not-created status screen, plus the create dialog when this is the next available month. */
export const MonthlyBudgetLocked: FC<MonthlyBudgetLockedProps> = ({ month, isAvailableMonth, createOpen, onCreateOpenChange, onCreated, onBack }) => {
	const t = useTranslations('monthly-budget-page')

	return (
		<>
			<StatusScreen
				variant='panel'
				icon={CalendarDaysIcon}
				title={t('locked.title')}
				description={isAvailableMonth ? t('locked.available-description') : t('locked.description')}
			>
				{isAvailableMonth ? (
					<Button onClick={() => onCreateOpenChange(true)}>{t('locked.create-button')}</Button>
				) : (
					<Button variant='outline' onClick={onBack}>
						{t('locked.back-button')}
					</Button>
				)}
			</StatusScreen>
			{isAvailableMonth && (
				<CreateMonthlyBudgetDialog month={month} open={createOpen} onOpenChange={onCreateOpenChange} onCreated={onCreated} />
			)}
		</>
	)
}
