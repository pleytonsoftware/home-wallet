import type { HouseholdDetail } from '@households/types'
import type { FullErrorResult } from '@lib/errors/types'

import { HOUSEHOLDS_API_PATHS } from '@households/constants/api'
import { HOUSEHOLDS_QUERY_KEYS } from '@households/constants/query-keys'
import { transformHouseholdDetails } from '@households/transforms/household'
import { getAxiosClient, getAxiosServerClient } from '@lib/query/api-client'
import { to } from '@lib/utils/to.utils'
import { environmentManager, queryOptions } from '@tanstack/react-query'

async function getHousehold(id: string) {
	const isServer = environmentManager.isServer()
	const client = isServer ? await getAxiosServerClient() : getAxiosClient()

	return client.get<HouseholdDetail<true>>(HOUSEHOLDS_API_PATHS.GET_HOUSEHOLD(id)).then((res) => transformHouseholdDetails(res.data))
}

export const getHouseholdOptions = (id: string) =>
	queryOptions({
		queryKey: HOUSEHOLDS_QUERY_KEYS.household(id),
		staleTime: 0, // Always fetch fresh detail so settings edits are reflected on navigation
		queryFn: async () => {
			const [error, data] = await to<HouseholdDetail, FullErrorResult>(getHousehold(id))

			if (error) {
				throw error
			}

			return data
		},
	})
