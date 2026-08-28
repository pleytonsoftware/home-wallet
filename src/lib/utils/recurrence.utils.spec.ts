import type { RecurrenceRule } from '@transactions/types'

import { RECURRENCE_FREQUENCY } from '@lib/constants/recurrence.enum'

import { computeNextOccurrence, computeOccurrencesInRange, isSeriesEnded } from './recurrence.utils'

describe('computeNextOccurrence', () => {
	it('returns the start date itself when it is on or after `from`', () => {
		const start = new Date('2026-08-15T00:00:00.000Z')
		const rule: RecurrenceRule = { frequency: RECURRENCE_FREQUENCY.MONTHLY }

		expect(computeNextOccurrence(start, rule, new Date('2026-08-01T00:00:00.000Z'))).toEqual(start)
	})

	it('advances monthly until on or after `from`', () => {
		const start = new Date('2026-06-15T00:00:00.000Z')
		const rule: RecurrenceRule = { frequency: RECURRENCE_FREQUENCY.MONTHLY }

		expect(computeNextOccurrence(start, rule, new Date('2026-08-10T00:00:00.000Z'))).toEqual(new Date('2026-08-15T00:00:00.000Z'))
	})

	it('respects a custom interval', () => {
		const start = new Date('2026-01-01T00:00:00.000Z')
		const rule: RecurrenceRule = { frequency: RECURRENCE_FREQUENCY.WEEKLY, interval: 2 }

		expect(computeNextOccurrence(start, rule, new Date('2026-01-20T00:00:00.000Z'))).toEqual(new Date('2026-01-29T00:00:00.000Z'))
	})

	it('handles biweekly as every-two-weeks', () => {
		const start = new Date('2026-01-01T00:00:00.000Z')
		const rule: RecurrenceRule = { frequency: RECURRENCE_FREQUENCY.BIWEEKLY }

		expect(computeNextOccurrence(start, rule, new Date('2026-01-01T00:00:00.000Z'))).toEqual(start)
		expect(computeNextOccurrence(start, rule, new Date('2026-01-10T00:00:00.000Z'))).toEqual(new Date('2026-01-15T00:00:00.000Z'))
	})

	it('returns null once past the endDate', () => {
		const start = new Date('2026-01-01T00:00:00.000Z')
		const rule: RecurrenceRule = { frequency: RECURRENCE_FREQUENCY.MONTHLY, endDate: '2026-03-01T00:00:00.000Z' }

		expect(computeNextOccurrence(start, rule, new Date('2026-04-01T00:00:00.000Z'))).toBeNull()
	})

	it('returns null once past the occurrences count', () => {
		const start = new Date('2026-01-01T00:00:00.000Z')
		const rule: RecurrenceRule = { frequency: RECURRENCE_FREQUENCY.MONTHLY, occurrences: 3 }

		// 3 occurrences: Jan, Feb, Mar — by June, the series is over.
		expect(computeNextOccurrence(start, rule, new Date('2026-06-01T00:00:00.000Z'))).toBeNull()
	})

	it('still returns the last occurrence when `from` falls within the occurrences count', () => {
		const start = new Date('2026-01-01T00:00:00.000Z')
		const rule: RecurrenceRule = { frequency: RECURRENCE_FREQUENCY.MONTHLY, occurrences: 3 }

		expect(computeNextOccurrence(start, rule, new Date('2026-03-01T00:00:00.000Z'))).toEqual(new Date('2026-03-01T00:00:00.000Z'))
	})

	it('respects a non-1 startOccurrenceCount when checking the occurrences cap', () => {
		const anchor = new Date('2026-06-01T00:00:00.000Z')
		const rule: RecurrenceRule = { frequency: RECURRENCE_FREQUENCY.MONTHLY, occurrences: 3 }

		// anchor is already occurrence #3 (the cap) — there should be no further occurrence, ever.
		expect(computeNextOccurrence(anchor, rule, new Date('2026-06-01T00:00:00.000Z'), 3)).toEqual(anchor)
		expect(computeNextOccurrence(anchor, rule, new Date('2026-07-01T00:00:00.000Z'), 3)).toBeNull()
	})
})

describe('computeOccurrencesInRange', () => {
	it('supports "every X days" via DAILY + interval', () => {
		const anchor = new Date('2026-08-01T00:00:00.000Z')
		const rule: RecurrenceRule = { frequency: RECURRENCE_FREQUENCY.DAILY, interval: 3, occurrenceCount: 1 }

		const result = computeOccurrencesInRange(anchor, rule, new Date('2026-08-01T00:00:00.000Z'), new Date('2026-08-15T00:00:00.000Z'))

		expect(result.map((o) => o.date)).toEqual([
			new Date('2026-08-04T00:00:00.000Z'),
			new Date('2026-08-07T00:00:00.000Z'),
			new Date('2026-08-10T00:00:00.000Z'),
			new Date('2026-08-13T00:00:00.000Z'),
		])
		expect(result.map((o) => o.occurrenceCount)).toEqual([2, 3, 4, 5])
	})

	it('produces multiple occurrences in one month for a weekly series', () => {
		const anchor = new Date('2026-07-06T00:00:00.000Z')
		const rule: RecurrenceRule = { frequency: RECURRENCE_FREQUENCY.WEEKLY, occurrenceCount: 1 }

		const result = computeOccurrencesInRange(anchor, rule, new Date('2026-08-01T00:00:00.000Z'), new Date('2026-08-31T00:00:00.000Z'))

		expect(result.map((o) => o.date)).toEqual([
			new Date('2026-08-03T00:00:00.000Z'),
			new Date('2026-08-10T00:00:00.000Z'),
			new Date('2026-08-17T00:00:00.000Z'),
			new Date('2026-08-24T00:00:00.000Z'),
			new Date('2026-08-31T00:00:00.000Z'),
		])
	})

	it('produces a single occurrence for a monthly series', () => {
		const anchor = new Date('2026-07-15T00:00:00.000Z')
		const rule: RecurrenceRule = { frequency: RECURRENCE_FREQUENCY.MONTHLY, occurrenceCount: 1 }

		const result = computeOccurrencesInRange(anchor, rule, new Date('2026-08-01T00:00:00.000Z'), new Date('2026-08-31T00:00:00.000Z'))

		expect(result.map((o) => o.date)).toEqual([new Date('2026-08-15T00:00:00.000Z')])
		expect(result.map((o) => o.occurrenceCount)).toEqual([2])
	})

	it('produces zero occurrences for a yearly series mid-cycle (gap month)', () => {
		const anchor = new Date('2026-01-15T00:00:00.000Z')
		const rule: RecurrenceRule = { frequency: RECURRENCE_FREQUENCY.YEARLY, occurrenceCount: 1 }

		const result = computeOccurrencesInRange(anchor, rule, new Date('2026-08-01T00:00:00.000Z'), new Date('2026-08-31T00:00:00.000Z'))

		expect(result).toEqual([])
	})

	it('respects a custom interval greater than 1', () => {
		const anchor = new Date('2026-06-15T00:00:00.000Z')
		const rule: RecurrenceRule = { frequency: RECURRENCE_FREQUENCY.MONTHLY, interval: 2, occurrenceCount: 1 }

		const result = computeOccurrencesInRange(anchor, rule, new Date('2026-08-01T00:00:00.000Z'), new Date('2026-08-31T00:00:00.000Z'))

		expect(result.map((o) => o.date)).toEqual([new Date('2026-08-15T00:00:00.000Z')])
	})

	it('stops once endDate is passed', () => {
		const anchor = new Date('2026-07-06T00:00:00.000Z')
		const rule: RecurrenceRule = { frequency: RECURRENCE_FREQUENCY.WEEKLY, endDate: '2026-08-12T00:00:00.000Z', occurrenceCount: 1 }

		const result = computeOccurrencesInRange(anchor, rule, new Date('2026-08-01T00:00:00.000Z'), new Date('2026-08-31T00:00:00.000Z'))

		expect(result.map((o) => o.date)).toEqual([new Date('2026-08-03T00:00:00.000Z'), new Date('2026-08-10T00:00:00.000Z')])
	})

	it('stops once the occurrences cap is reached, counting from occurrenceCount', () => {
		const anchor = new Date('2026-07-06T00:00:00.000Z')
		const rule: RecurrenceRule = { frequency: RECURRENCE_FREQUENCY.WEEKLY, occurrences: 5, occurrenceCount: 1 }

		const result = computeOccurrencesInRange(anchor, rule, new Date('2026-08-01T00:00:00.000Z'), new Date('2026-08-31T00:00:00.000Z'))

		// occurrences 2-4 (07-13, 07-20, 07-27) fall in July; occurrence 5 (08-03) is the last the cap allows.
		expect(result.map((o) => o.date)).toEqual([new Date('2026-08-03T00:00:00.000Z')])
		expect(result.map((o) => o.occurrenceCount)).toEqual([5])
	})
})

describe('isSeriesEnded', () => {
	it('is false for a never-ending series (no endDate or occurrences)', () => {
		const rule: RecurrenceRule = { frequency: RECURRENCE_FREQUENCY.MONTHLY }

		expect(isSeriesEnded(new Date('2026-01-15T00:00:00.000Z'), rule)).toBe(false)
	})

	it("is false when the endDate is still ahead of the anchor's next occurrence", () => {
		const rule: RecurrenceRule = { frequency: RECURRENCE_FREQUENCY.MONTHLY, endDate: '2027-01-01T00:00:00.000Z' }

		expect(isSeriesEnded(new Date('2026-06-15T00:00:00.000Z'), rule)).toBe(false)
	})

	it("is true once the anchor's next occurrence would be past endDate", () => {
		const rule: RecurrenceRule = { frequency: RECURRENCE_FREQUENCY.MONTHLY, endDate: '2026-07-01T00:00:00.000Z' }

		// next occurrence from the anchor would be 2026-07-15, already past the endDate.
		expect(isSeriesEnded(new Date('2026-06-15T00:00:00.000Z'), rule)).toBe(true)
	})

	it('is false while occurrenceCount is still below the occurrences cap', () => {
		const rule: RecurrenceRule = { frequency: RECURRENCE_FREQUENCY.MONTHLY, occurrences: 5, occurrenceCount: 3 }

		expect(isSeriesEnded(new Date('2026-06-15T00:00:00.000Z'), rule)).toBe(false)
	})

	it('is true once occurrenceCount has reached the occurrences cap', () => {
		const rule: RecurrenceRule = { frequency: RECURRENCE_FREQUENCY.MONTHLY, occurrences: 5, occurrenceCount: 5 }

		expect(isSeriesEnded(new Date('2026-06-15T00:00:00.000Z'), rule)).toBe(true)
	})

	it('does not depend on "now" — only whether the cap has been reached at the anchor', () => {
		// endDate is a year away, but the series is not "ended" just because that date hasn't arrived.
		const rule: RecurrenceRule = { frequency: RECURRENCE_FREQUENCY.MONTHLY, endDate: '2027-06-15T00:00:00.000Z' }

		expect(isSeriesEnded(new Date('2026-01-15T00:00:00.000Z'), rule)).toBe(false)
	})
})
