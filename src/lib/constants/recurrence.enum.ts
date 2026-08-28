/**
 * How often a recurring transaction repeats. Lives inside `Transaction.recurrenceRule` (a JSON
 * column) rather than as its own database column.
 */
export enum RECURRENCE_FREQUENCY {
	DAILY = 'daily',
	WEEKLY = 'weekly',
	BIWEEKLY = 'biweekly',
	MONTHLY = 'monthly',
	YEARLY = 'yearly',
}
