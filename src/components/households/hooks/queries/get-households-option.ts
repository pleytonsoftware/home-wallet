import type { HouseholdSummary } from '@households/types'
import type { FullErrorResult } from '@lib/errors/types'

import { HOUSEHOLDS_API_PATHS } from '@households/constants/api'
import { HOUSEHOLDS_QUERY_KEYS } from '@households/constants/query-keys'
import { transformHouseholdSummary } from '@households/transforms/household'
import { getAxiosClient, getAxiosServerClient } from '@lib/query/api-client'
import { to } from '@lib/utils/to.utils'
import { environmentManager, queryOptions } from '@tanstack/react-query'

async function getHouseholds() {
	const isServer = environmentManager.isServer()
	const client = isServer ? await getAxiosServerClient() : getAxiosClient()

	return client.get<HouseholdSummary[]>(HOUSEHOLDS_API_PATHS.GET_HOUSEHOLDS).then((res) => res.data.map(transformHouseholdSummary))
}

export const getHouseholdsOptions = () =>
	queryOptions({
		queryKey: HOUSEHOLDS_QUERY_KEYS.households,
		staleTime: 0, // Set staleTime to 0 to always fetch fresh data
		queryFn: async () => {
			const [error, data] = await to<HouseholdSummary[], FullErrorResult>(getHouseholds())

			if (error) {
				throw error
			}

			return data
		},
	})
