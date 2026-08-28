'use client'

import type { RecurringSeriesSummary } from '@transactions/types'
import type { FC } from 'react'

import { useState } from 'react'

import { RepeatIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Skeleton } from '@atoms/skeleton'
import { useHouseholdContext } from '@households/context/household.context'
import { PageHeader } from '@molecules/page-header'
import { StatusScreen } from '@molecules/status-screen'
import { useQuery } from '@tanstack/react-query'
import { getRecurringSeriesOptions } from '@transactions/hooks/queries/get-recurring-series-option'

import { RecurringSeriesDetailSheet } from './recurring-series-detail-sheet'
import { RecurringSeriesRow } from './recurring-series-row'

export const RecurringSeriesPage: FC = () => {
	const t = useTranslations('transactions-recurring-page')
	const { household } = useHouseholdContext()
	const { data: series = [], isPending } = useQuery(getRecurringSeriesOptions(household.id))
	const [selected, setSelected] = useState<RecurringSeriesSummary | null>(null)

	const active = series.filter((s) => s.status === 'active')
	const past = series.filter((s) => s.status === 'ended')

	return (
		<div className='mx-auto flex w-full flex-col gap-6 py-4 px-4 sm:px-0'>
			<PageHeader icon={RepeatIcon} eyebrow={t('eyebrow')} title={t('title')} description={t('description')} />

			{isPending ? (
				<div className='flex flex-col gap-2'>
					{Array.from({ length: 3 }).map((_, index) => (
						<Skeleton key={index} className='h-14 rounded-lg' />
					))}
				</div>
			) : series.length === 0 ? (
				<StatusScreen variant='panel' icon={RepeatIcon} title={t('empty-state.title')} description={t('empty-state.description')} />
			) : (
				<div className='flex flex-col gap-6'>
					{active.length > 0 && (
						<div className='flex flex-col gap-1'>
							<span className='px-2 text-sm font-medium text-muted-foreground'>{t('sections.active')}</span>
							<div className='flex flex-col gap-0.5 rounded-xl border bg-card p-1'>
								{active.map((item) => (
									<RecurringSeriesRow key={item.seriesId} series={item} onSelect={setSelected} />
								))}
							</div>
						</div>
					)}

					{past.length > 0 && (
						<div className='flex flex-col gap-1'>
							<span className='px-2 text-sm font-medium text-muted-foreground'>{t('sections.past')}</span>
							<div className='flex flex-col gap-0.5 rounded-xl border bg-card p-1 opacity-70'>
								{past.map((item) => (
									<RecurringSeriesRow key={item.seriesId} series={item} onSelect={setSelected} />
								))}
							</div>
						</div>
					)}
				</div>
			)}

			<RecurringSeriesDetailSheet series={selected} householdId={household.id} onOpenChange={(open) => !open && setSelected(null)} />
		</div>
	)
}
