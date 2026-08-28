import type { CATEGORY_COLOR } from '@lib/constants/category-color.enum'
import type { CATEGORY_ICON } from '@lib/constants/category-icon.enum'
import type { PAYMENT_TYPE } from '@lib/constants/payment.enum'
import type { Prisma } from '@lib/prisma'
import type { RecurrenceRule, RecurringSeriesStatus, RecurringSeriesSummary, TransactionSummary } from '@transactions/types'

export const transformTransactionSummary = (raw: TransactionSummary): TransactionSummary => ({
	...raw,
	type: raw.type as PAYMENT_TYPE,
})

type TransactionRow = Prisma.TransactionGetPayload<{ include: { category: true; sourceAccount: true } }>

/** Serializes a Prisma `Transaction` row (with `category`/`sourceAccount` included) into the wire-format `TransactionSummary`. */
export const serializeTransaction = (transaction: TransactionRow): TransactionSummary => ({
	id: transaction.id,
	monthlyBudgetId: transaction.monthlyBudgetId,
	name: transaction.name,
	amount: transaction.amount,
	type: transaction.type as PAYMENT_TYPE,
	category: transaction.category
		? {
				id: transaction.category.id,
				name: transaction.category.name,
				color: transaction.category.color as CATEGORY_COLOR,
				icon: transaction.category.icon as CATEGORY_ICON,
				isBase: transaction.category.isBase,
			}
		: null,
	sourceAccount: transaction.sourceAccount ? { id: transaction.sourceAccount.id, name: transaction.sourceAccount.name } : null,
	note: transaction.note,
	date: transaction.date.toISOString(),
	isRecurring: transaction.isRecurring,
	recurrenceRule: (transaction.recurrenceRule as RecurrenceRule | null) ?? null,
	createdAt: transaction.createdAt.toISOString(),
})

/** Serializes a series' anchor transaction row into the wire-format `RecurringSeriesSummary`. */
export const serializeRecurringSeries = (
	anchor: TransactionRow,
	extra: { seriesId: string; status: RecurringSeriesStatus; nextOccurrenceDate: string | null },
): RecurringSeriesSummary => {
	const rule = anchor.recurrenceRule as unknown as RecurrenceRule

	return {
		seriesId: extra.seriesId,
		anchorTransactionId: anchor.id,
		name: anchor.name,
		amount: anchor.amount,
		type: anchor.type as PAYMENT_TYPE,
		category: anchor.category
			? {
					id: anchor.category.id,
					name: anchor.category.name,
					color: anchor.category.color as CATEGORY_COLOR,
					icon: anchor.category.icon as CATEGORY_ICON,
					isBase: anchor.category.isBase,
				}
			: null,
		sourceAccount: anchor.sourceAccount ? { id: anchor.sourceAccount.id, name: anchor.sourceAccount.name } : null,
		note: anchor.note,
		frequency: rule.frequency,
		interval: rule.interval,
		endDate: rule.endDate,
		occurrences: rule.occurrences,
		occurrenceCount: rule.occurrenceCount ?? 1,
		lastOccurrenceDate: anchor.date.toISOString(),
		nextOccurrenceDate: extra.nextOccurrenceDate,
		status: extra.status,
	}
}
