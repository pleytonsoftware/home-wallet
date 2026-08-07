import type { BUDGET_STATUS } from '@lib/constants/budget.enum'

/** Status of a single month tile in the Monthly Selection grid/list, per the sequential creation rule. */
export type MonthTileStatus = 'created' | 'available' | 'locked' | 'not-created'

export interface MonthlyBudgetTotals {
	income: number
	expenses: number
	/** `income - expenses`, computed — not stored. */
	savings: number
}

export interface MonthlyBudgetSummary {
	id: string
	/** `YYYY-MM` */
	month: string
	status: BUDGET_STATUS
	/** `null` when the member skipped setting a spending target for this month. */
	targetAmount: number | null
	totals: MonthlyBudgetTotals
	createdAt: string
}

/** Response for the monthly-budgets list endpoint — lets the client compute every tile's status. */
export interface MonthlyBudgetsListResponse {
	budgets: Array<MonthlyBudgetSummary>
	/** `YYYY-MM` — the single month currently eligible for creation. */
	nextAvailableMonth: string
}

/** Response for a single month's budget lookup — `budget` is `null` when that month hasn't been created yet. */
export interface MonthlyBudgetDetailResponse {
	budget: MonthlyBudgetSummary | null
	/** `YYYY-MM` — the single month currently eligible for creation. */
	nextAvailableMonth: string
}

/** A single month tile in the Monthly Selection grid/list. */
export interface MonthTile {
	/** `YYYY-MM` */
	month: string
	status: MonthTileStatus
	budget?: MonthlyBudgetSummary
}

export interface CreateMonthlyBudgetPayload {
	month: string
	targetAmount?: number
}
