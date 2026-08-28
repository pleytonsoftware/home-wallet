export const TRANSACTIONS_QUERY_KEYS = {
	transactions: (householdId: string, monthlyBudgetId: string) => ['transactions', householdId, monthlyBudgetId] as const,
	recurringSeries: (householdId: string) => ['transactions', householdId, 'recurring'] as const,
} as const
