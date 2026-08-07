import type { FullErrorResult } from '@lib/errors/types'
import type { MonthlyBudgetsListResponse } from '@monthly-budgets/types'

import { getAxiosClient, getAxiosServerClient } from '@lib/query/api-client'
import { to } from '@lib/utils/to.utils'
import { MONTHLY_BUDGETS_API_PATHS } from '@monthly-budgets/constants/api'
import { MONTHLY_BUDGETS_QUERY_KEYS } from '@monthly-budgets/constants/query-keys'
import { environmentManager, queryOptions } from '@tanstack/react-query'

async function getMonthlyBudgets(householdId: string, year: number) {
	const isServer = environmentManager.isServer()
	const client = isServer ? await getAxiosServerClient() : getAxiosClient()

	return client.get<MonthlyBudgetsListResponse>(MONTHLY_BUDGETS_API_PATHS.GET_MONTHLY_BUDGETS(householdId, year)).then((res) => res.data)
}

export const getMonthlyBudgetsOptions = (householdId: string, year: number) =>
	queryOptions({
		queryKey: MONTHLY_BUDGETS_QUERY_KEYS.monthlyBudgets(householdId, year),
		staleTime: 0,
		queryFn: async () => {
			const [error, data] = await to<MonthlyBudgetsListResponse, FullErrorResult>(getMonthlyBudgets(householdId, year))

			if (error) {
				throw error
			}

			return data
		},
	})
