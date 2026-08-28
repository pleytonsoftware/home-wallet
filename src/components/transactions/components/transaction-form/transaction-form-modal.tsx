'use client'

import type { TransactionMode, TransactionFormMode, TransactionSummary } from '@transactions/types'
import type { FC, ReactNode } from 'react'

import { useRef, useState } from 'react'

import { useTranslations } from 'next-intl'

import { cn } from '@cn'
import { useIsMobile } from '@hooks/use-mobile'
import { useHouseholdContext } from '@households/context/household.context'
import {
	ResponsiveSheet,
	ResponsiveSheetContent,
	ResponsiveSheetDescription,
	ResponsiveSheetHeader,
	ResponsiveSheetTitle,
	ResponsiveSheetTrigger,
} from '@molecules/responsive-sheet'
import { TransactionMultipleForm } from '@transactions/components/transaction-form/multiple/transaction-multiple-form'
import { TransactionForm } from '@transactions/components/transaction-form/transaction-form'

import { TransactionModeToggler } from './transaction-mode-toggler'

interface TransactionFormModalProps {
	mode: TransactionMode
	transaction?: TransactionSummary
	monthlyBudgetId: string
	monthlyBudgetMonth: Date
	open: boolean
	onOpenChange: (open: boolean) => void
	/** Rendered via `ResponsiveSheetTrigger asChild` when provided — omit when opened imperatively. */
	trigger?: ReactNode
}

export const TransactionFormModal: FC<TransactionFormModalProps> = ({
	mode,
	transaction,
	monthlyBudgetId,
	monthlyBudgetMonth,
	open,
	onOpenChange,
	trigger,
}) => {
	const [transactionInputMode, setTransactionInputMode] = useState<TransactionFormMode>('single')
	const [quickAdd, setQuickAdd] = useState(false)
	const t = useTranslations('transactions-personal-page.form')
	const { household } = useHouseholdContext()
	const isMobile = useIsMobile()
	const containerRef = useRef<HTMLDivElement>(null)

	const canShowMultiple = mode === 'create' && !isMobile
	const isDraftGridActive = canShowMultiple && transactionInputMode === 'multiple' && !quickAdd

	return (
		<ResponsiveSheet open={open} onOpenChange={onOpenChange}>
			{trigger && <ResponsiveSheetTrigger asChild>{trigger}</ResponsiveSheetTrigger>}
			<ResponsiveSheetContent
				ref={containerRef}
				className={cn(
					'flex flex-col gap-0 overflow-y-auto max-w-full! w-full!',
					canShowMultiple && transactionInputMode === 'multiple' ? 'md:max-w-4xl! lg:max-w-6xl!' : 'md:max-w-xl! lg:max-w-3xl!',
				)}
				onEscapeKeyDown={(event) => {
					if (isDraftGridActive) event.preventDefault()
				}}
			>
				<ResponsiveSheetHeader>
					<div className='flex flex-wrap items-center justify-between gap-2'>
						<ResponsiveSheetTitle>{mode === 'create' ? t('create-title') : t('edit-title')}</ResponsiveSheetTitle>
					</div>
					<ResponsiveSheetDescription>{mode === 'create' ? t('create-description') : t('edit-description')}</ResponsiveSheetDescription>
				</ResponsiveSheetHeader>

				<div className='flex flex-1 flex-col overflow-y-auto gap-4 px-4 pb-4'>
					{canShowMultiple && (
						<div className='flex'>
							<TransactionModeToggler
								value={transactionInputMode}
								onChange={(next) => {
									if (next) setTransactionInputMode(next)
								}}
							/>
						</div>
					)}
					{transactionInputMode === 'single' || !canShowMultiple ? (
						<TransactionForm
							mode={mode}
							transaction={transaction}
							monthlyBudgetId={monthlyBudgetId}
							monthlyBudgetMonth={monthlyBudgetMonth}
							containerRef={containerRef}
							onSuccess={() => onOpenChange(false)}
							onCancel={() => onOpenChange(false)}
						/>
					) : (
						<TransactionMultipleForm
							householdId={household.id}
							monthlyBudgetId={monthlyBudgetId}
							monthlyBudgetMonth={monthlyBudgetMonth}
							containerRef={containerRef}
							quickAdd={quickAdd}
							onQuickAddChange={setQuickAdd}
							onSuccess={() => onOpenChange(false)}
						/>
					)}
				</div>
			</ResponsiveSheetContent>
		</ResponsiveSheet>
	)
}
