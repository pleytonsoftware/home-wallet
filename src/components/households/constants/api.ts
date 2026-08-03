export const HOUSEHOLDS_API_PATHS = {
	GET_HOUSEHOLDS: '/households' as const,
	GET_HOUSEHOLD: (id: string) => `/households/${id}` as const,
	GET_REMOVED_MEMBERS: (id: string) => `/households/${id}/members/removed` as const,
} as const
