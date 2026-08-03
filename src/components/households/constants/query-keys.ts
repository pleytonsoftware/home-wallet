export const HOUSEHOLDS_QUERY_KEYS = {
	households: ['households'] as const,
	household: (id: string) => [...HOUSEHOLDS_QUERY_KEYS.households, id],
	removedMembers: (id: string) => [...HOUSEHOLDS_QUERY_KEYS.households, id, 'removed-members'] as const,
} as const
