export const CATEGORIES_QUERY_KEYS = {
	categories: (householdId: string) => ['categories', householdId] as const,
} as const
