export const HOUSEHOLDS_QUERY_KEYS = {
	households: ['households'] as const,
	household: (id: string) => [...HOUSEHOLDS_QUERY_KEYS.households, id],
} as const
