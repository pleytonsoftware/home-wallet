import type { RemovedHouseholdMember } from '@households/types'
import type { FullErrorResult } from '@lib/errors/types'

import { HOUSEHOLDS_API_PATHS } from '@households/constants/api'
import { HOUSEHOLDS_QUERY_KEYS } from '@households/constants/query-keys'
import { getAxiosClient, getAxiosServerClient } from '@lib/query/api-client'
import { to } from '@lib/utils/to.utils'
import { environmentManager, queryOptions } from '@tanstack/react-query'

async function getRemovedMembers(householdId: string) {
	const isServer = environmentManager.isServer()
	const client = isServer ? await getAxiosServerClient() : getAxiosClient()

	return client.get<RemovedHouseholdMember[]>(HOUSEHOLDS_API_PATHS.GET_REMOVED_MEMBERS(householdId)).then((res) => res.data)
}

export const getRemovedMembersOptions = (householdId: string) =>
	queryOptions({
		queryKey: HOUSEHOLDS_QUERY_KEYS.removedMembers(householdId),
		staleTime: 0,
		queryFn: async () => {
			const [error, data] = await to<RemovedHouseholdMember[], FullErrorResult>(getRemovedMembers(householdId))

			if (error) {
				throw error
			}

			return data
		},
	})
