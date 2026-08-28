'use client'

import type { MonthTile } from '@monthly-budgets/types'
import type { FC } from 'react'

import { useRouter } from '@/i18n/navigation'

import { useMemo, useState } from 'react'

import { CalendarRangeIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useQueryState, parseAsInteger } from 'nuqs'

import { Button } from '@atoms/button'
import { Icon } from '@atoms/icon'
import { Skeleton } from '@atoms/skeleton'
import { useCookieState } from '@hooks/use-cookie-state'
import { useHouseholdContext } from '@households/context/household.context'
import { ROUTES } from '@lib/constants/routes.const'
import { PageHeader } from '@molecules/page-header'
import { CreateMonthlyBudgetDialog } from '@monthly-budgets/components/create-monthly-budget-dialog'
import { MonthGrid } from '@monthly-budgets/components/month-grid'
import { MonthList } from '@monthly-budgets/components/month-list'
import { type MonthSelectionView, ViewToggle } from '@monthly-budgets/components/view-toggle'
import { MONTH_SELECTION_VIEW_COOKIE_MAX_AGE, MONTH_SELECTION_VIEW_COOKIE_NAME } from '@monthly-budgets/constants/view'
import { getMonthlyBudgetsOptions } from '@monthly-budgets/hooks/queries/get-monthly-budgets-option'
import { useQuery } from '@tanstack/react-query'

interface MonthSelectionPageProps {
	initialView: MonthSelectionView
}

export const MonthSelectionPage: FC<MonthSelectionPageProps> = ({ initialView }) => {
	const t = useTranslations('monthly-budget-page')
	const router = useRouter()
	const { household } = useHouseholdContext()
	const [year, setYear] = useQueryState('year', parseAsInteger.withDefault(new Date().getFullYear()))
	const [view, setView] = useCookieState<MonthSelectionView>(MONTH_SELECTION_VIEW_COOKIE_NAME, initialView, {
		maxAge: MONTH_SELECTION_VIEW_COOKIE_MAX_AGE,
	})
	const [createMonth, setCreateMonth] = useState<string | null>(null)

	const { data, isLoading } = useQuery(getMonthlyBudgetsOptions(household.id, year))

	const tiles = useMemo<Array<MonthTile>>(() => {
		if (!data) return []
		const budgetsByMonth = new Map(data.budgets.map((budget) => [budget.month, budget]))

		return Array.from({ length: 12 }, (_, index) => {
			const month = `${year}-${String(index + 1).padStart(2, '0')}`
			const budget = budgetsByMonth.get(month)
			const status: MonthTile['status'] = budget
				? 'created'
				: month === data.nextAvailableMonth
					? 'available'
					: month < data.nextAvailableMonth
						? 'not-created'
						: 'locked'

			return { month, status, budget }
		})
	}, [data, year])

	const handleOpen = (month: string) => router.push(ROUTES.HOUSEHOLD.BUDGETS.PERSONAL_MONTH.replace(':id', household.id).replace(':month', month))

	return (
		<div className='mx-auto flex w-full flex-col gap-6 py-4 px-4 sm:px-0'>
			<div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
				<PageHeader icon={CalendarRangeIcon} eyebrow={t('eyebrow')} title={t('title')} description={t('description')} />
				<ViewToggle value={view} onChange={setView} />
			</div>

			<div className='flex items-center justify-center gap-3'>
				<Button variant='ghost' size='icon-sm' onClick={() => setYear((current) => current - 1)} aria-label={t('year.previous')}>
					<Icon IconComponent={ChevronLeftIcon} size='sm' />
				</Button>
				<span className='w-16 text-center font-semibold'>{year}</span>
				<Button variant='ghost' size='icon-sm' onClick={() => setYear((current) => current + 1)} aria-label={t('year.next')}>
					<Icon IconComponent={ChevronRightIcon} size='sm' />
				</Button>
			</div>

			{isLoading ? (
				<div className='grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4'>
					{Array.from({ length: 12 }).map((_, index) => (
						<Skeleton key={index} className='h-24 rounded-2xl' />
					))}
				</div>
			) : view === 'grid' ? (
				<MonthGrid tiles={tiles} onOpen={handleOpen} onCreate={setCreateMonth} />
			) : (
				<MonthList tiles={tiles} onOpen={handleOpen} onCreate={setCreateMonth} />
			)}

			{createMonth && (
				<CreateMonthlyBudgetDialog
					month={createMonth}
					open={!!createMonth}
					onOpenChange={(open) => !open && setCreateMonth(null)}
					onCreated={handleOpen}
				/>
			)}
		</div>
	)
}
