import type { CATEGORY_COLOR } from '@lib/constants/category-color.enum'
import type { CATEGORY_ICON } from '@lib/constants/category-icon.enum'
import type { PAYMENT_TYPE } from '@lib/constants/payment.enum'
import type { RECURRENCE_FREQUENCY } from '@lib/constants/recurrence.enum'

export interface RecurrenceRule {
	frequency: RECURRENCE_FREQUENCY
	interval?: number
	/** ISO date — mutually exclusive with `occurrences`. */
	endDate?: string
	/** Mutually exclusive with `endDate`. */
	occurrences?: number
	/** Server-only bookkeeping: identifies all materialized rows belonging to the same recurring series. Never user-editable. */
	seriesId?: string
	/** Server-only bookkeeping: how many occurrences of this series have been materialized so far (1 = origin). Never user-editable. */
	occurrenceCount?: number
}

export interface TransactionCategorySummary {
	id: string
	name: string
	color: CATEGORY_COLOR
	icon: CATEGORY_ICON
	isBase: boolean
}

export interface TransactionAccountSummary {
	id: string
	name: string
}

export interface TransactionSummary {
	id: string
	monthlyBudgetId: string
	name: string
	amount: number
	type: PAYMENT_TYPE
	category?: TransactionCategorySummary | null
	sourceAccount?: TransactionAccountSummary | null
	note?: string | null
	/** ISO date */
	date: string
	isRecurring: boolean
	recurrenceRule?: RecurrenceRule | null
	createdAt: string
}

export type TransactionMode = 'create' | 'edit'
export type TransactionFormMode = 'single' | 'multiple' | 'AI'

export type RecurringSeriesStatus = 'active' | 'ended'

/** One row per recurring series — derived from the series' anchor (latest materialized) transaction. */
export interface RecurringSeriesSummary {
	seriesId: string
	/** The anchor transaction's id — target for the edit-template form. */
	anchorTransactionId: string
	name: string
	amount: number
	type: PAYMENT_TYPE
	category?: TransactionCategorySummary | null
	sourceAccount?: TransactionAccountSummary | null
	note?: string | null
	frequency: RECURRENCE_FREQUENCY
	interval?: number
	/** ISO date */
	endDate?: string
	occurrences?: number
	occurrenceCount: number
	/** ISO date of the anchor's own occurrence. */
	lastOccurrenceDate: string
	/** ISO date of the next due occurrence — only present when `status === 'active'`. */
	nextOccurrenceDate?: string | null
	status: RecurringSeriesStatus
}
