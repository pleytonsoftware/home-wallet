import type { RecurrenceRule } from '@transactions/types'

import { addDays, addMonths, addWeeks, addYears } from 'date-fns'

import { RECURRENCE_FREQUENCY } from '@lib/constants/recurrence.enum'

export const advanceByFrequency = (date: Date, frequency: RECURRENCE_FREQUENCY, interval: number): Date => {
	switch (frequency) {
		case RECURRENCE_FREQUENCY.DAILY:
			return addDays(date, interval)
		case RECURRENCE_FREQUENCY.WEEKLY:
			return addWeeks(date, interval)
		case RECURRENCE_FREQUENCY.BIWEEKLY:
			return addWeeks(date, interval * 2)
		case RECURRENCE_FREQUENCY.MONTHLY:
			return addMonths(date, interval)
		case RECURRENCE_FREQUENCY.YEARLY:
			return addYears(date, interval)
	}
}

const toUtcMidnight = (date: Date): Date => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))

/**
 * Computes the next occurrence of a recurring transaction on or after `from`, for display purposes
 * (e.g. the "recurring" badge's next-due date, or a recurring series' "next due" display) — not
 * used to materialize real ledger rows. Returns `null` once the series has ended (past `endDate`
 * or `occurrences`). `startOccurrenceCount` lets this be called from a series' anchor row (whose
 * `occurrenceCount` may not be 1) rather than only from the series' true origin.
 */
export const computeNextOccurrence = (startDate: Date, rule: RecurrenceRule, from: Date = new Date(), startOccurrenceCount = 1): Date | null => {
	const interval = Math.max(rule.interval ?? 1, 1)
	const endDate = rule.endDate ? new Date(rule.endDate) : null

	let occurrence = startDate
	let count = startOccurrenceCount

	while (occurrence < from) {
		if (endDate && occurrence >= endDate) return null
		if (rule.occurrences && count >= rule.occurrences) return null

		occurrence = advanceByFrequency(occurrence, rule.frequency, interval)
		count++
	}

	if (endDate && occurrence > endDate) return null
	if (rule.occurrences && count > rule.occurrences) return null

	return occurrence
}

/**
 * Has this series already produced its last possible occurrence, independent of "now"? Unlike
 * checking `endDate < today`, this only looks at whether the anchor's cap (`endDate`/`occurrences`)
 * has already been reached as of the anchor itself — a series whose `endDate` is next year is not
 * "ended" just because `endDate` hasn't arrived yet; it's ended once no further occurrence can ever
 * be produced from the anchor forward.
 */
export const isSeriesEnded = (anchorDate: Date, rule: RecurrenceRule): boolean => {
	const interval = Math.max(rule.interval ?? 1, 1)

	if (rule.endDate) {
		const nextOccurrence = advanceByFrequency(toUtcMidnight(anchorDate), rule.frequency, interval)
		if (nextOccurrence > new Date(rule.endDate)) return true
	}

	if (rule.occurrences && (rule.occurrenceCount ?? 1) >= rule.occurrences) return true

	return false
}

/**
 * Walks a recurring series forward from its latest materialized occurrence (`anchorDate`,
 * already reflecting `rule.occurrenceCount`) and returns every occurrence landing inside
 * `[rangeStart, rangeEnd]` (inclusive) — used to materialize real ledger rows into a newly
 * created monthly budget. Stops early once `endDate` or `occurrences` ends the series.
 */
export const computeOccurrencesInRange = (
	anchorDate: Date,
	rule: RecurrenceRule,
	rangeStart: Date,
	rangeEnd: Date,
): Array<{ date: Date; occurrenceCount: number }> => {
	const interval = Math.max(rule.interval ?? 1, 1)
	const endDate = rule.endDate ? new Date(rule.endDate) : null
	const occurrences: Array<{ date: Date; occurrenceCount: number }> = []

	let occurrence = advanceByFrequency(toUtcMidnight(anchorDate), rule.frequency, interval)
	let count = (rule.occurrenceCount ?? 1) + 1

	while (occurrence <= rangeEnd) {
		if (endDate && occurrence > endDate) break
		if (rule.occurrences && count > rule.occurrences) break

		if (occurrence >= rangeStart) occurrences.push({ date: occurrence, occurrenceCount: count })

		occurrence = advanceByFrequency(occurrence, rule.frequency, interval)
		count++
	}

	return occurrences
}
