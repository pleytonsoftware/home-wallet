import { describe, it, expect } from 'vitest'

import {
	addMonthsUtc,
	computeNextAvailableMonth,
	formatMonthParam,
	getDefaultTransactionDate,
	isSameMonth,
	lastDayOfMonthUtc,
	parseMonthParam,
	toMonthStart,
} from './monthly-budget.utils'

describe('toMonthStart', () => {
	it('normalizes a date to the first day of its month at UTC midnight', () => {
		const result = toMonthStart(new Date('2026-08-17T14:32:00.000Z'))
		expect(result.toISOString()).toBe('2026-08-01T00:00:00.000Z')
	})
})

describe('addMonthsUtc', () => {
	it('adds whole months', () => {
		const result = addMonthsUtc(new Date('2026-08-01T00:00:00.000Z'), 1)
		expect(result.toISOString()).toBe('2026-09-01T00:00:00.000Z')
	})

	it('rolls over into the next year', () => {
		const result = addMonthsUtc(new Date('2026-12-01T00:00:00.000Z'), 1)
		expect(result.toISOString()).toBe('2027-01-01T00:00:00.000Z')
	})

	it('supports subtracting months via a negative value', () => {
		const result = addMonthsUtc(new Date('2026-01-01T00:00:00.000Z'), -1)
		expect(result.toISOString()).toBe('2025-12-01T00:00:00.000Z')
	})
})

describe('parseMonthParam', () => {
	it('parses a valid YYYY-MM string', () => {
		const result = parseMonthParam('2026-08')
		expect(result?.toISOString()).toBe('2026-08-01T00:00:00.000Z')
	})

	it.each(['2026-13', '2026-00', '2026/08', '26-08', 'not-a-month', ''])('returns null for an invalid value: %s', (value) => {
		expect(parseMonthParam(value)).toBeNull()
	})
})

describe('formatMonthParam', () => {
	it('formats a month-start date as YYYY-MM', () => {
		expect(formatMonthParam(new Date(Date.UTC(2026, 7, 1)))).toBe('2026-08')
	})

	it('pads single-digit months', () => {
		expect(formatMonthParam(new Date(Date.UTC(2026, 0, 1)))).toBe('2026-01')
	})
})

describe('isSameMonth', () => {
	it('returns true for two dates in the same month', () => {
		expect(isSameMonth(new Date('2026-08-01T00:00:00.000Z'), new Date('2026-08-28T23:00:00.000Z'))).toBe(true)
	})

	it('returns false for dates in different months', () => {
		expect(isSameMonth(new Date('2026-08-01T00:00:00.000Z'), new Date('2026-09-01T00:00:00.000Z'))).toBe(false)
	})
})

describe('lastDayOfMonthUtc', () => {
	it('returns the last day of a 31-day month', () => {
		expect(lastDayOfMonthUtc(new Date('2026-08-01T00:00:00.000Z')).toISOString()).toBe('2026-08-31T00:00:00.000Z')
	})

	it('returns the last day of February in a non-leap year', () => {
		expect(lastDayOfMonthUtc(new Date('2026-02-01T00:00:00.000Z')).toISOString()).toBe('2026-02-28T00:00:00.000Z')
	})

	it('returns the last day of February in a leap year', () => {
		expect(lastDayOfMonthUtc(new Date('2028-02-01T00:00:00.000Z')).toISOString()).toBe('2028-02-29T00:00:00.000Z')
	})
})

describe('computeNextAvailableMonth', () => {
	it('returns the current calendar month when there is no latest budget', () => {
		const now = new Date('2026-08-17T14:32:00.000Z')
		expect(computeNextAvailableMonth(null, now).toISOString()).toBe('2026-08-01T00:00:00.000Z')
	})

	it('returns the month after the latest created budget', () => {
		const latest = new Date('2026-06-01T00:00:00.000Z')
		expect(computeNextAvailableMonth(latest).toISOString()).toBe('2026-07-01T00:00:00.000Z')
	})
})

describe('getDefaultTransactionDate', () => {
	it('returns today when the budget month is the current calendar month', () => {
		const monthlyBudgetMonth = new Date('2026-08-01T00:00:00.000Z')
		const now = new Date('2026-08-20T14:32:00.000Z')
		expect(getDefaultTransactionDate(monthlyBudgetMonth, now)).toBe(now)
	})

	it('returns the budget month unchanged when it is not the current calendar month', () => {
		const monthlyBudgetMonth = new Date('2026-06-01T00:00:00.000Z')
		const now = new Date('2026-08-20T14:32:00.000Z')
		expect(getDefaultTransactionDate(monthlyBudgetMonth, now)).toBe(monthlyBudgetMonth)
	})
})
