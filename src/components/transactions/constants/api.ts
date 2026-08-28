export const TRANSACTIONS_API_PATHS = {
	GET_TRANSACTIONS: (householdId: string, monthlyBudgetId: string) =>
		`/households/${householdId}/transactions?monthlyBudgetId=${monthlyBudgetId}` as const,
	GET_RECURRING_SERIES: (householdId: string) => `/households/${householdId}/transactions/recurring` as const,
} as const
