export const HOUSEHOLDS_API_PATHS = {
	GET_HOUSEHOLDS: '/households' as const,
	GET_HOUSEHOLD: (id: string) => `/households/${id}` as const,
} as const
