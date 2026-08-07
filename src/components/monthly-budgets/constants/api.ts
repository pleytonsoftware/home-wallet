export const MONTHLY_BUDGETS_API_PATHS = {
	GET_MONTHLY_BUDGETS: (householdId: string, year: number) => `/households/${householdId}/monthly-budgets?year=${year}` as const,
	GET_MONTHLY_BUDGET: (householdId: string, month: string) => `/households/${householdId}/monthly-budgets/${month}` as const,
} as const
