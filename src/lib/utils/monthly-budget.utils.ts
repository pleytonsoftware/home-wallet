/** Normalizes a date to the first day of its month at UTC midnight, matching how `MonthlyBudget.month` is stored. */
export const toMonthStart = (date: Date): Date => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1))

/** Adds (or subtracts, with a negative value) whole calendar months to a month-start date. */
export const addMonthsUtc = (date: Date, months: number): Date => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1))

/** Parses a `YYYY-MM` route param into a month-start `Date` (UTC). */
export const parseMonthParam = (month: string): Date | null => {
	const match = /^(\d{4})-(\d{2})$/.exec(month)
	if (!match) return null

	const year = Number(match[1])
	const monthIndex = Number(match[2]) - 1
	if (monthIndex < 0 || monthIndex > 11) return null

	return new Date(Date.UTC(year, monthIndex, 1))
}

/** Formats a month-start `Date` into a `YYYY-MM` route param. */
export const formatMonthParam = (date: Date): string => `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`

export const isSameMonth = (a: Date, b: Date): boolean => a.getUTCFullYear() === b.getUTCFullYear() && a.getUTCMonth() === b.getUTCMonth()

/** The last calendar day of a month-start date, at UTC midnight. */
export const lastDayOfMonthUtc = (monthStart: Date): Date => new Date(Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 0))

/**
 * Computes the next month a member is allowed to create a personal budget for: the month after
 * their latest created budget, or the current calendar month if they have none yet.
 */
export const computeNextAvailableMonth = (latestBudgetMonth: Date | null, now: Date = new Date()): Date =>
	latestBudgetMonth ? addMonthsUtc(latestBudgetMonth, 1) : toMonthStart(now)

/**
 * Defaults a new transaction's date to today when the target budget is the current calendar
 * month, otherwise keeps the budget's month-start date.
 */
export const getDefaultTransactionDate = (monthlyBudgetMonth: Date, now: Date = new Date()): Date =>
	isSameMonth(monthlyBudgetMonth, now) ? now : monthlyBudgetMonth
