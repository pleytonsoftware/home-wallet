import type { BUDGET_STATUS } from '@lib/constants/budget.enum'
import type { MonthlyBudgetSummary, MonthlyBudgetTotals } from '@monthly-budgets/types'

import { formatMonthParam } from '@lib/utils/monthly-budget.utils'

interface MonthlyBudgetRow {
	id: string
	month: Date
	status: string
	targetAmount: number | null
	createdAt: Date
}

export const computeMonthlyBudgetTotals = (income: number, expenses: number): MonthlyBudgetTotals => ({
	income,
	expenses,
	savings: income - expenses,
})

export const serializeMonthlyBudget = (budget: MonthlyBudgetRow, totals: MonthlyBudgetTotals): MonthlyBudgetSummary => ({
	id: budget.id,
	month: formatMonthParam(budget.month),
	status: budget.status as BUDGET_STATUS,
	targetAmount: budget.targetAmount,
	totals,
	createdAt: budget.createdAt.toISOString(),
})
