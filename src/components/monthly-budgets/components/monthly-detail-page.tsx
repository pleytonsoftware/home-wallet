'use client'

import type { FC } from 'react'

import { useRouter } from '@/i18n/navigation'

import { useState } from 'react'

import { CalendarDaysIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@atoms/button'
import { Skeleton } from '@atoms/skeleton'
import { useHouseholdContext } from '@households/context/household.context'
import { ROUTES } from '@lib/constants/routes.const'
import { addMonthsUtc, formatMonthParam, parseMonthParam } from '@lib/utils/monthly-budget.utils'
import { PageHeader } from '@molecules/page-header'
import { StatusScreen } from '@molecules/status-screen'
import { CreateMonthlyBudgetDialog } from '@monthly-budgets/components/create-monthly-budget-dialog'
import { MonthlySummaryHeader } from '@monthly-budgets/components/monthly-summary-header'
import { getMonthlyBudgetOptions } from '@monthly-budgets/hooks/queries/get-monthly-budget-option'
import { useQuery } from '@tanstack/react-query'

interface MonthlyDetailPageProps {
	month: string
}

export const MonthlyDetailPage: FC<MonthlyDetailPageProps> = ({ month }) => {
	const t = useTranslations('monthly-budget-page')
	const router = useRouter()
	const { household } = useHouseholdContext()
	const [createOpen, setCreateOpen] = useState(false)

	const { data, isLoading } = useQuery(getMonthlyBudgetOptions(household.id, month))
	const monthDate = parseMonthParam(month)

	const navigateToMonth = (target: Date) =>
		router.push(ROUTES.HOUSEHOLD.TRANSACTIONS.PERSONAL_MONTH.replace(':id', household.id).replace(':month', formatMonthParam(target)))

	if (isLoading || !monthDate) {
		return (
			<div className='mx-auto flex w-full flex-col gap-6 py-4 px-4 sm:px-0'>
				<Skeleton className='h-24 rounded-2xl' />
			</div>
		)
	}

	const isAvailableMonth = data?.nextAvailableMonth === month

	return (
		<div className='mx-auto flex w-full flex-col gap-6 py-4 px-4 sm:px-0'>
			<PageHeader icon={CalendarDaysIcon} eyebrow={t('eyebrow')} title={t('title')} description={t('description')} />

			{data?.budget ? (
				<MonthlySummaryHeader
					budget={data.budget}
					onPrevious={() => navigateToMonth(addMonthsUtc(monthDate, -1))}
					onNext={() => navigateToMonth(addMonthsUtc(monthDate, 1))}
				/>
			) : (
				<>
					<StatusScreen
						variant='panel'
						icon={CalendarDaysIcon}
						title={t('locked.title')}
						description={isAvailableMonth ? t('locked.available-description') : t('locked.description')}
					>
						{isAvailableMonth ? (
							<Button onClick={() => setCreateOpen(true)}>{t('locked.create-button')}</Button>
						) : (
							<Button
								variant='outline'
								onClick={() => router.push(ROUTES.HOUSEHOLD.TRANSACTIONS.PERSONAL.replace(':id', household.id))}
							>
								{t('locked.back-button')}
							</Button>
						)}
					</StatusScreen>
					{isAvailableMonth && (
						<CreateMonthlyBudgetDialog
							month={month}
							open={createOpen}
							onOpenChange={setCreateOpen}
							onCreated={() => navigateToMonth(monthDate)}
						/>
					)}
				</>
			)}
		</div>
	)
}
