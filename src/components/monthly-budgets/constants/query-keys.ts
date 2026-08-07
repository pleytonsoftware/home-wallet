export const MONTHLY_BUDGETS_QUERY_KEYS = {
	/** Shared prefix for every monthly-budget query of this household — invalidate this after a mutation to refresh both the list and any open month's detail. */
	all: (householdId: string) => ['monthly-budgets', householdId] as const,
	monthlyBudgets: (householdId: string, year: number) => [...MONTHLY_BUDGETS_QUERY_KEYS.all(householdId), 'list', year] as const,
	monthlyBudget: (householdId: string, month: string) => [...MONTHLY_BUDGETS_QUERY_KEYS.all(householdId), 'detail', month] as const,
} as const
