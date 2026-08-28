'use client'

import type { TransactionSummary } from '@transactions/types'
import type { FC } from 'react'

import { ArrowDownLeftIcon, ArrowUpRightIcon, ChevronRightIcon, RepeatIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Icon } from '@atoms/icon'
import { Tooltip, TooltipContent, TooltipTrigger } from '@atoms/tooltip'
import { CATEGORY_COLOR_CLASSES } from '@categories/constants/colors'
import { CATEGORY_ICON_COMPONENTS } from '@categories/constants/icons'
import { useCategoryDisplayName } from '@categories/hooks/use-category-display-name.hook'
import { cn } from '@cn'
import { useHouseholdContext } from '@households/context/household.context'
import { formatCurrency } from '@households/utils'
import { PAYMENT_TYPE } from '@lib/constants/payment.enum'

interface TransactionRowProps {
	transaction: TransactionSummary
	onSelect: (transaction: TransactionSummary) => void
}

export const TransactionRow: FC<TransactionRowProps> = ({ transaction, onSelect }) => {
	const t = useTranslations('transactions-personal-page')
	const { household } = useHouseholdContext()
	const getCategoryDisplayName = useCategoryDisplayName()
	const isIncome = transaction.type === PAYMENT_TYPE.INCOME
	const colorClasses = transaction.category ? CATEGORY_COLOR_CLASSES[transaction.category.color] : null
	const categoryIcon = transaction.category ? CATEGORY_ICON_COMPONENTS[transaction.category.icon] : null

	return (
		<button
			type='button'
			onClick={() => onSelect(transaction)}
			className='flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted/60'
		>
			<span
				className={cn(
					'flex size-9 shrink-0 items-center justify-center rounded-full',
					colorClasses?.badge ?? 'bg-muted text-muted-foreground',
				)}
			>
				<Icon IconComponent={categoryIcon ?? (isIncome ? ArrowUpRightIcon : ArrowDownLeftIcon)} size='sm' />
			</span>

			<span className='min-w-0 flex-1'>
				<span className='flex items-center gap-1.5'>
					<span className='truncate font-medium'>{transaction.name}</span>
					{transaction.isRecurring && (
						<Tooltip>
							<TooltipTrigger asChild>
								<span className='inline-flex shrink-0'>
									<Icon IconComponent={RepeatIcon} size='xs' className='text-muted-foreground' />
								</span>
							</TooltipTrigger>
							<TooltipContent>{t('row.recurring')}</TooltipContent>
						</Tooltip>
					)}
				</span>
				{transaction.category && (
					<span className='block truncate text-xs text-muted-foreground'>{getCategoryDisplayName(transaction.category)}</span>
				)}
			</span>

			<span className={cn('shrink-0 font-semibold', isIncome ? 'text-success' : 'text-destructive')}>
				{isIncome ? '+' : '-'}
				{formatCurrency(transaction.amount, household.config.currency)}
			</span>

			<Icon IconComponent={ChevronRightIcon} size='sm' className='shrink-0 text-muted-foreground' />
		</button>
	)
}
