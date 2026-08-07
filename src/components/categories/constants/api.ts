export const CATEGORIES_API_PATHS = {
	GET_CATEGORIES: (householdId: string) => `/households/${householdId}/categories` as const,
} as const
