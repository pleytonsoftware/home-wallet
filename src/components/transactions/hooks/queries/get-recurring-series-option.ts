import type { FullErrorResult } from '@lib/errors/types'
import type { RecurringSeriesSummary } from '@transactions/types'

import { getAxiosClient, getAxiosServerClient } from '@lib/query/api-client'
import { to } from '@lib/utils/to.utils'
import { environmentManager, queryOptions } from '@tanstack/react-query'
import { TRANSACTIONS_API_PATHS } from '@transactions/constants/api'
import { TRANSACTIONS_QUERY_KEYS } from '@transactions/constants/query-keys'

async function getRecurringSeries(householdId: string) {
	const isServer = environmentManager.isServer()
	const client = isServer ? await getAxiosServerClient() : getAxiosClient()

	return client.get<Array<RecurringSeriesSummary>>(TRANSACTIONS_API_PATHS.GET_RECURRING_SERIES(householdId)).then((res) => res.data)
}

export const getRecurringSeriesOptions = (householdId: string) =>
	queryOptions({
		queryKey: TRANSACTIONS_QUERY_KEYS.recurringSeries(householdId),
		staleTime: 0,
		queryFn: async () => {
			const [error, data] = await to<Array<RecurringSeriesSummary>, FullErrorResult>(getRecurringSeries(householdId))

			if (error) {
				throw error
			}

			return data
		},
	})
