import type { Prisma } from '@lib/prisma'
import type { RecurrenceRule } from '@transactions/types'

import { lastDayOfMonthUtc } from '@lib/utils/monthly-budget.utils'
import { computeOccurrencesInRange } from '@lib/utils/recurrence.utils'

export interface RecurringSeriesAnchor {
	name: string
	amount: number
	type: string
	categoryId: string | null
	sourceAccountId: string | null
	note: string | null
	date: Date
	recurrenceRule: RecurrenceRule
}

export interface RecurringSeriesTargetBudget {
	id: string
	month: Date
}

interface MaterializeRecurringSeriesForwardParams {
	householdId: string
	householdMemberId: string
	anchor: RecurringSeriesAnchor
	/** Must already be sorted ascending by month. */
	targetBudgets: Array<RecurringSeriesTargetBudget>
}

/**
 * Walks a recurring series forward from `anchor` across one or more already-known target budgets
 * (in ascending month order), creating a real `Transaction` row for every due occurrence and
 * threading the anchor (date + `occurrenceCount`) forward as it goes — so `occurrences`/`endDate`
 * caps and interval math stay correct across multiple budgets, not just one.
 */
export async function materializeRecurringSeriesForward(
	tx: Prisma.TransactionClient,
	{ householdId, householdMemberId, anchor, targetBudgets }: MaterializeRecurringSeriesForwardParams,
): Promise<void> {
	let anchorDate = anchor.date
	let rule = anchor.recurrenceRule

	for (const budget of targetBudgets) {
		const occurrences = computeOccurrencesInRange(anchorDate, rule, budget.month, lastDayOfMonthUtc(budget.month))

		for (const occurrence of occurrences) {
			const occurrenceRule = { ...rule, occurrenceCount: occurrence.occurrenceCount }

			await tx.transaction.create({
				data: {
					householdId,
					householdMemberId,
					monthlyBudgetId: budget.id,
					name: anchor.name,
					amount: anchor.amount,
					type: anchor.type,
					categoryId: anchor.categoryId,
					sourceAccountId: anchor.sourceAccountId,
					note: anchor.note,
					date: occurrence.date,
					isRecurring: true,
					recurrenceRule: occurrenceRule,
				},
			})

			anchorDate = occurrence.date
			rule = occurrenceRule
		}
	}
}

/**
 * Groups a flat list of recurring transactions by `recurrenceRule.seriesId`, keeping only the
 * max-`date` row per series as its anchor — the representative row future materialization (and
 * series listing/management) reads its template and bookkeeping (`occurrenceCount`) from. Rows
 * without a `seriesId` (never stamped) are ignored.
 */
export function groupBySeriesAnchor<T extends { date: Date; recurrenceRule: unknown }>(transactions: Array<T>): Map<string, T> {
	const anchorBySeriesId = new Map<string, T>()

	for (const transaction of transactions) {
		const rule = transaction.recurrenceRule as RecurrenceRule | null
		if (!rule?.seriesId) continue

		const currentAnchor = anchorBySeriesId.get(rule.seriesId)
		if (!currentAnchor || transaction.date > currentAnchor.date) anchorBySeriesId.set(rule.seriesId, transaction)
	}

	return anchorBySeriesId
}

/**
 * Stops a recurring series from ever being carried forward again — flips `isRecurring: false`
 * across every transaction sharing `seriesId`. Materialization only ever considers
 * `isRecurring: true` rows as candidate anchors, so this alone is sufficient; no separate
 * "cancelled" flag is needed.
 */
export async function cancelRecurringSeries(
	tx: Prisma.TransactionClient,
	{ householdMemberId, seriesId }: { householdMemberId: string; seriesId: string },
): Promise<void> {
	await tx.transaction.updateMany({
		where: { householdMemberId, recurrenceRule: { path: ['seriesId'], equals: seriesId } },
		data: { isRecurring: false },
	})
}
