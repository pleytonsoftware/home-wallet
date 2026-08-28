'use client'

import type { RefObject, FC } from 'react'

import { TransactionFormContainerProvider } from '@transactions/components/transaction-form/transaction-form.context'

import { TransactionDraftGrid } from './transaction-draft-grid'
import { TransactionMultipleIntroDialog } from './transaction-multiple-intro-dialog'
import { TransactionQuickAddList } from './transaction-quick-add-list'
import { TransactionQuickAddToggle } from './transaction-quick-add-toggle'
import { TransactionShortcutsPopover } from './transaction-shortcuts-popover'

interface TransactionMultipleFormProps {
	householdId: string
	monthlyBudgetId: string
	monthlyBudgetMonth: Date
	/** The sheet's own portal container — so nested combobox/dropdown popups portal inside it instead of `document.body`, which is what makes the sheet's own outside-interaction detection treat clicks/focus inside them as "outside" and swallow the interaction. */
	containerRef: RefObject<HTMLDivElement | null>
	/** Lifted to the parent Sheet — it also needs to know this to keep Escape from closing the sheet while Draft mode owns it. */
	quickAdd: boolean
	onQuickAddChange: (value: boolean) => void
	onSuccess: () => void
}

/** Multiple mode's container: switches between Draft mode (default) and Quick add mode. */
export const TransactionMultipleForm: FC<TransactionMultipleFormProps> = ({
	householdId,
	monthlyBudgetId,
	monthlyBudgetMonth,
	containerRef,
	quickAdd,
	onQuickAddChange,
	onSuccess,
}) => {
	return (
		<TransactionFormContainerProvider value={containerRef}>
			<div className='flex flex-1 flex-col gap-3 overflow-hidden'>
				<TransactionMultipleIntroDialog />
				<div className='flex items-center justify-end gap-1'>
					<TransactionShortcutsPopover />
					<TransactionQuickAddToggle value={quickAdd} onChange={onQuickAddChange} />
				</div>

				{quickAdd ? (
					<TransactionQuickAddList householdId={householdId} monthlyBudgetId={monthlyBudgetId} monthlyBudgetMonth={monthlyBudgetMonth} />
				) : (
					<TransactionDraftGrid monthlyBudgetId={monthlyBudgetId} monthlyBudgetMonth={monthlyBudgetMonth} onSuccess={onSuccess} />
				)}
			</div>
		</TransactionFormContainerProvider>
	)
}
