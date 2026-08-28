'use client'

import type { ViewEditMode } from '@lib/types/mode'
import type { RecurringSeriesSummary } from '@transactions/types'
import type { FC, ReactNode } from 'react'

import { useRef, useState } from 'react'

import { EllipsisVerticalIcon, PencilIcon, TagIcon, XCircleIcon } from 'lucide-react'
import { useFormatter, useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { Button } from '@atoms/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@atoms/dropdown-menu'
import { Icon } from '@atoms/icon'
import { CategoryBadge } from '@categories/components/category-badge'
import { CATEGORY_COLOR_CLASSES } from '@categories/constants/colors'
import { CATEGORY_ICON_COMPONENTS } from '@categories/constants/icons'
import { useCategoryDisplayName } from '@categories/hooks/use-category-display-name.hook'
import { cn } from '@cn'
import { useHouseholdContext } from '@households/context/household.context'
import { formatCurrency } from '@households/utils'
import { PAYMENT_TYPE } from '@lib/constants/payment.enum'
import { ConfirmSaveButton } from '@molecules/confirm-save-button'
import { ResponsiveSheet, ResponsiveSheetContent, ResponsiveSheetHeader, ResponsiveSheetTitle } from '@molecules/responsive-sheet'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { TRANSACTIONS_QUERY_KEYS } from '@transactions/constants/query-keys'
import { endRecurringSeriesMutationOptions } from '@transactions/hooks/mutations/end-recurring-series.hook'

import { RecurringSeriesForm } from './recurring-series-form'

interface RecurringSeriesDetailSheetProps {
	series: RecurringSeriesSummary | null
	householdId: string
	onOpenChange: (open: boolean) => void
}

export const RecurringSeriesDetailSheet: FC<RecurringSeriesDetailSheetProps> = ({ series, householdId, onOpenChange }) => {
	const t = useTranslations('transactions-recurring-page.detail')
	const tFrequency = useTranslations('common.fields.recurrence-frequency')
	const format = useFormatter()
	const { household } = useHouseholdContext()
	const getCategoryDisplayName = useCategoryDisplayName()
	const queryClient = useQueryClient()
	const containerRef = useRef<HTMLDivElement>(null)
	const [mode, setMode] = useState<ViewEditMode>('view')

	const endMutation = useMutation(
		endRecurringSeriesMutationOptions(series?.seriesId ?? '', {
			onSuccess: async (res) => {
				if (!res.success) {
					toast.error(t('end.error'))
					return
				}
				await queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEYS.recurringSeries(householdId) })
				toast.success(t('end.success'))
				onOpenChange(false)
			},
			onError: () => toast.error(t('end.error')),
		}),
	)

	const handleOpenChange = (open: boolean) => {
		onOpenChange(open)
		if (!open) setMode('view')
	}

	if (!series) return null

	const isIncome = series.type === PAYMENT_TYPE.INCOME
	const colorClasses = series.category ? CATEGORY_COLOR_CLASSES[series.category.color] : null
	const categoryIcon = series.category ? CATEGORY_ICON_COMPONENTS[series.category.icon] : TagIcon

	return (
		<ResponsiveSheet open={!!series} onOpenChange={handleOpenChange}>
			<ResponsiveSheetContent
				ref={containerRef}
				className='gap-0 overflow-y-auto'
				actionsNode={
					series.status === 'active' && mode === 'view'
						? (container) => (
								<DropdownMenu modal={false}>
									<DropdownMenuTrigger asChild>
										<Button variant='ghost' size='icon-sm' aria-label={t('actions')}>
											<Icon IconComponent={EllipsisVerticalIcon} size='sm' />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align='end' container={container}>
										<DropdownMenuItem onSelect={() => setMode('edit')}>
											<Icon IconComponent={PencilIcon} size='sm' />
											{t('edit')}
										</DropdownMenuItem>
										<ConfirmSaveButton
											variant='ghost'
											className='w-full justify-start gap-2 px-2 font-normal text-destructive hover:text-destructive'
											loading={endMutation.isPending}
											confirmVariant='destructive'
											dialogTitle={t('end.confirm-title')}
											dialogDescription={t('end.confirm-description', { name: series.name })}
											confirm={t('end.confirm-button')}
											onConfirmClick={() => endMutation.mutate()}
										>
											<Icon IconComponent={XCircleIcon} size='sm' />
											{t('end.trigger')}
										</ConfirmSaveButton>
									</DropdownMenuContent>
								</DropdownMenu>
							)
						: undefined
				}
			>
				{mode === 'edit' ? (
					<>
						<ResponsiveSheetHeader>
							<ResponsiveSheetTitle>{t('edit-title')}</ResponsiveSheetTitle>
						</ResponsiveSheetHeader>
						<div className='flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4'>
							<RecurringSeriesForm
								householdId={householdId}
								series={series}
								containerRef={containerRef}
								onSuccess={() => setMode('view')}
								onCancel={() => setMode('view')}
							/>
						</div>
					</>
				) : (
					<>
						<ResponsiveSheetHeader className='flex-row items-start justify-between gap-2 space-y-0'>
							<div className='flex items-center gap-3'>
								<span
									className={cn(
										'flex size-10 shrink-0 items-center justify-center rounded-full',
										colorClasses?.badge ?? 'bg-muted text-muted-foreground',
									)}
								>
									<Icon IconComponent={categoryIcon} size='md' />
								</span>
								<div>
									<ResponsiveSheetTitle>{series.name}</ResponsiveSheetTitle>
									{series.category && <p className='text-sm text-muted-foreground'>{getCategoryDisplayName(series.category)}</p>}
								</div>
							</div>
						</ResponsiveSheetHeader>

						<div className='flex flex-col gap-6 px-4 pb-4'>
							<p className={cn('text-3xl font-bold', isIncome ? 'text-success' : 'text-destructive')}>
								{isIncome ? '+' : '-'}
								{formatCurrency(series.amount, household.config.currency)}
							</p>

							<dl className='flex flex-col divide-y divide-border rounded-lg border'>
								<DetailRow label={t('status')} value={series.status === 'active' ? t('status-active') : t('status-ended')} />
								<DetailRow
									label={t('frequency')}
									value={
										series.interval && series.interval > 1
											? `${tFrequency(series.frequency)} (×${series.interval})`
											: tFrequency(series.frequency)
									}
								/>
								{series.endDate && (
									<DetailRow label={t('end-date')} value={format.dateTime(new Date(series.endDate), { dateStyle: 'medium' })} />
								)}
								{series.occurrences && (
									<DetailRow label={t('occurrences')} value={`${series.occurrenceCount} / ${series.occurrences}`} />
								)}
								{series.status === 'active' && series.nextOccurrenceDate && (
									<DetailRow
										label={t('next-due')}
										value={format.dateTime(new Date(series.nextOccurrenceDate), { dateStyle: 'medium' })}
									/>
								)}
								{series.status === 'ended' && (
									<DetailRow
										label={t('last-occurrence')}
										value={format.dateTime(new Date(series.lastOccurrenceDate), { dateStyle: 'medium' })}
									/>
								)}
								<DetailRow label={t('account')} value={series.sourceAccount?.name ?? t('none')} />
								{series.category && (
									<DetailRow
										label={t('category')}
										value={
											<CategoryBadge
												name={getCategoryDisplayName(series.category)}
												color={series.category.color}
												icon={series.category.icon}
											/>
										}
									/>
								)}
								{series.note && <DetailRow label={t('note')} value={series.note} />}
							</dl>
						</div>
					</>
				)}
			</ResponsiveSheetContent>
		</ResponsiveSheet>
	)
}

const DetailRow: FC<{ label: string; value: ReactNode }> = ({ label, value }) => (
	<div className='flex items-center justify-between gap-4 px-3 py-2.5'>
		<dt className='text-sm text-muted-foreground'>{label}</dt>
		<dd className='text-sm font-medium'>{value}</dd>
	</div>
)
