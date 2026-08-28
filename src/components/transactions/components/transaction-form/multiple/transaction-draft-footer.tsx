'use client'

import type { CreateTransactionInput } from '@lib/schemas/transaction/create-transaction'
import type { FC } from 'react'
import type { AutosaveStatus } from './use-transaction-draft-persistence.hook'

import { Loader2Icon, PlusIcon, SaveIcon, Trash2Icon } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@atoms/button'
import { Icon } from '@atoms/icon'
import { Kbd } from '@atoms/kbd'
import { cn } from '@cn'
import { useHouseholdContext } from '@households/context/household.context'
import { formatCurrency } from '@households/utils'

import { TransactionAutosaveToggle } from './transaction-autosave-toggle'
import { computeDraftTotals } from './transaction-draft.utils'

interface TransactionDraftFooterProps {
	rows: Array<CreateTransactionInput>
	autosaveStatus: AutosaveStatus
	autosaveEnabled: boolean
	onAutosaveEnabledChange: (value: boolean) => void
	isSubmitting: boolean
	onAddRow: () => void
	onClearDraft: () => void
}

export const TransactionDraftFooter: FC<TransactionDraftFooterProps> = ({
	rows,
	autosaveStatus,
	autosaveEnabled,
	onAutosaveEnabledChange,
	isSubmitting,
	onAddRow,
	onClearDraft,
}) => {
	const t = useTranslations('transactions-personal-page.form.multiple')
	const { household } = useHouseholdContext()
	const { count, total } = computeDraftTotals(rows)

	return (
		<div className='mt-auto flex flex-wrap items-center justify-between gap-3 border-t pt-3'>
			<div className='flex flex-wrap items-center gap-2'>
				<Button type='button' variant='outline' size='sm' className='gap-1.5' onClick={onAddRow} disabled={isSubmitting}>
					<Icon IconComponent={PlusIcon} size='sm' />
					{t('add-row')}
				</Button>
				<Button type='button' variant='ghost' size='sm' className='gap-1.5' onClick={onClearDraft} disabled={isSubmitting || count === 0}>
					<Icon IconComponent={Trash2Icon} size='sm' />
					{t('clear-draft')}
				</Button>
				<TransactionAutosaveToggle value={autosaveEnabled} onChange={onAutosaveEnabledChange} />
			</div>

			<div className='flex flex-wrap items-center gap-3'>
				<span
					className={cn('transition-opacity duration-300', autosaveStatus === 'idle' ? 'opacity-0' : 'opacity-100')}
					aria-label={autosaveStatus === 'saving' ? t('autosave.saving') : t('autosave.saved')}
				>
					{autosaveStatus === 'saving' ? (
						<Icon IconComponent={Loader2Icon} size='xs' className='animate-spin text-muted-foreground' />
					) : (
						<Icon IconComponent={SaveIcon} size='xs' className='text-muted-foreground' />
					)}
				</span>
				<span className='text-sm text-muted-foreground'>
					{t('transactions-count', { count })} &middot; {t('total')}:{' '}
					<span className={cn('font-medium', total < 0 && 'text-destructive', total > 0 && 'text-success')}>
						{formatCurrency(total, household.config.currency)}
					</span>
				</span>
				<Button type='submit' className='gap-2' disabled={count === 0} loading={isSubmitting}>
					{t('save-all')}
					<Kbd className='bg-primary-foreground/15 text-primary-foreground'>⌘Enter</Kbd>
				</Button>
			</div>
		</div>
	)
}
