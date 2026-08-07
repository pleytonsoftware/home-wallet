import type { CategorySummary } from '@categories/types'
import type { FullErrorResult } from '@lib/errors/types'

import { CATEGORIES_API_PATHS } from '@categories/constants/api'
import { CATEGORIES_QUERY_KEYS } from '@categories/constants/query-keys'
import { getAxiosClient, getAxiosServerClient } from '@lib/query/api-client'
import { to } from '@lib/utils/to.utils'
import { environmentManager, queryOptions } from '@tanstack/react-query'

async function getCategories(householdId: string) {
	const isServer = environmentManager.isServer()
	const client = isServer ? await getAxiosServerClient() : getAxiosClient()

	return client.get<Array<CategorySummary>>(CATEGORIES_API_PATHS.GET_CATEGORIES(householdId)).then((res) => res.data)
}

export const getCategoriesOptions = (householdId: string) =>
	queryOptions({
		queryKey: CATEGORIES_QUERY_KEYS.categories(householdId),
		staleTime: 0,
		queryFn: async () => {
			const [error, data] = await to<Array<CategorySummary>, FullErrorResult>(getCategories(householdId))

			if (error) {
				throw error
			}

			return data
		},
	})
