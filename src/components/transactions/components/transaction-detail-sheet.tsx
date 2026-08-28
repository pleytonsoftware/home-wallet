'use client'

import type { TransactionSummary } from '@transactions/types'
import type { FC, ReactNode } from 'react'

import { useState } from 'react'

import { PencilIcon, TagIcon, TrashIcon } from 'lucide-react'
import { useFormatter, useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { Button } from '@atoms/button'
import { Icon } from '@atoms/icon'
import { ToggleGroup, ToggleGroupItem } from '@atoms/toggle-group'
import { CategoryBadge } from '@categories/components/category-badge'
import { CATEGORY_COLOR_CLASSES } from '@categories/constants/colors'
import { CATEGORY_ICON_COMPONENTS } from '@categories/constants/icons'
import { useCategoryDisplayName } from '@categories/hooks/use-category-display-name.hook'
import { cn } from '@cn'
import { useHouseholdContext } from '@households/context/household.context'
import { formatCurrency } from '@households/utils'
import { PAYMENT_TYPE } from '@lib/constants/payment.enum'
import { logger } from '@lib/logger'
import { ConfirmSaveButton } from '@molecules/confirm-save-button'
import {
	ResponsiveSheet,
	ResponsiveSheetContent,
	ResponsiveSheetFooter,
	ResponsiveSheetHeader,
	ResponsiveSheetTitle,
} from '@molecules/responsive-sheet'
import { MONTHLY_BUDGETS_QUERY_KEYS } from '@monthly-budgets/constants/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { TRANSACTIONS_QUERY_KEYS } from '@transactions/constants/query-keys'
import { deleteTransactionMutationOptions } from '@transactions/hooks/mutations/delete-transaction.hook'

interface TransactionDetailSheetProps {
	transaction: TransactionSummary | null
	householdId: string
	onOpenChange: (open: boolean) => void
	onEdit: (transaction: TransactionSummary) => void
}

export const TransactionDetailSheet: FC<TransactionDetailSheetProps> = ({ transaction, householdId, onOpenChange, onEdit }) => {
	const t = useTranslations('transactions-personal-page.detail')
	const tDelete = useTranslations('transactions-personal-page.delete')
	const format = useFormatter()
	const { household } = useHouseholdContext()
	const getCategoryDisplayName = useCategoryDisplayName()
	const queryClient = useQueryClient()
	const [deleteScope, setDeleteScope] = useState<'occurrence' | 'series'>('occurrence')

	const deleteMutation = useMutation(
		deleteTransactionMutationOptions(transaction?.id ?? '', {
			onSuccess: async (res) => {
				if (!res.success) {
					toast.error(tDelete('error'))
					return
				}
				await Promise.all([
					queryClient.invalidateQueries({ queryKey: MONTHLY_BUDGETS_QUERY_KEYS.all(householdId) }),
					transaction &&
						queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEYS.transactions(householdId, transaction.monthlyBudgetId) }),
				])
				toast.success(tDelete('success'))
				onOpenChange(false)
			},
			onError: (err) => {
				logger.error('An error has ocurred: {err}', { err })
				toast.error(tDelete('error'))
			},
		}),
	)

	if (!transaction) return null

	const isIncome = transaction.type === PAYMENT_TYPE.INCOME
	const colorClasses = transaction.category ? CATEGORY_COLOR_CLASSES[transaction.category.color] : null
	const categoryIcon = transaction.category ? CATEGORY_ICON_COMPONENTS[transaction.category.icon] : TagIcon

	return (
		<ResponsiveSheet open={!!transaction} onOpenChange={onOpenChange}>
			<ResponsiveSheetContent className='gap-0 overflow-y-auto'>
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
							<ResponsiveSheetTitle>{transaction.name}</ResponsiveSheetTitle>
							{transaction.category && <p className='text-sm text-muted-foreground'>{getCategoryDisplayName(transaction.category)}</p>}
						</div>
					</div>
				</ResponsiveSheetHeader>

				<div className='flex flex-col gap-6 px-4 pb-4'>
					<p className={cn('text-3xl font-bold', isIncome ? 'text-success' : 'text-destructive')}>
						{isIncome ? '+' : '-'}
						{formatCurrency(transaction.amount, household.config.currency)}
					</p>

					<dl className='flex flex-col divide-y divide-border rounded-lg border'>
						<DetailRow label={t('date')} value={format.dateTime(new Date(transaction.date), { dateStyle: 'medium' })} />
						<DetailRow
							label={t('category')}
							value={
								transaction.category ? (
									<CategoryBadge
										name={getCategoryDisplayName(transaction.category)}
										color={transaction.category.color}
										icon={transaction.category.icon}
									/>
								) : (
									t('none')
								)
							}
						/>
						<DetailRow label={t('account')} value={transaction.sourceAccount?.name ?? t('none')} />
						<DetailRow label={t('recurring')} value={transaction.isRecurring ? t('yes') : t('no')} />
						{transaction.note && <DetailRow label={t('note')} value={transaction.note} />}
					</dl>
				</div>

				<ResponsiveSheetFooter className='flex-row gap-2'>
					<Button variant='outline' className='flex-1 gap-2' onClick={() => onEdit(transaction)}>
						<Icon IconComponent={PencilIcon} size='sm' />
						{t('edit')}
					</Button>
					<ConfirmSaveButton
						variant='destructive'
						className='flex-1 gap-2'
						loading={deleteMutation.isPending}
						confirmVariant='destructive'
						dialogTitle={tDelete('confirm-title')}
						dialogDescription={tDelete('confirm-description', { name: transaction.name })}
						dialogChildren={
							transaction.isRecurring && (
								<ToggleGroup
									type='single'
									variant='outline'
									className='justify-start'
									value={deleteScope}
									onValueChange={(next) => next && setDeleteScope(next as 'occurrence' | 'series')}
								>
									<ToggleGroupItem value='occurrence'>{tDelete('scope.occurrence')}</ToggleGroupItem>
									<ToggleGroupItem value='series'>{tDelete('scope.series')}</ToggleGroupItem>
								</ToggleGroup>
							)
						}
						confirm={tDelete('confirm-button')}
						onConfirmClick={() => deleteMutation.mutate({ cancelSeries: deleteScope === 'series' })}
					>
						<Icon IconComponent={TrashIcon} size='sm' />
						{tDelete('trigger')}
					</ConfirmSaveButton>
				</ResponsiveSheetFooter>
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
