import type { FullErrorResult } from '@lib/errors/types'
import type { MonthlyBudgetDetailResponse } from '@monthly-budgets/types'

import { getAxiosClient, getAxiosServerClient } from '@lib/query/api-client'
import { to } from '@lib/utils/to.utils'
import { MONTHLY_BUDGETS_API_PATHS } from '@monthly-budgets/constants/api'
import { MONTHLY_BUDGETS_QUERY_KEYS } from '@monthly-budgets/constants/query-keys'
import { environmentManager, queryOptions } from '@tanstack/react-query'

async function getMonthlyBudget(householdId: string, month: string) {
	const isServer = environmentManager.isServer()
	const client = isServer ? await getAxiosServerClient() : getAxiosClient()

	return client.get<MonthlyBudgetDetailResponse>(MONTHLY_BUDGETS_API_PATHS.GET_MONTHLY_BUDGET(householdId, month)).then((res) => res.data)
}

export const getMonthlyBudgetOptions = (householdId: string, month: string) =>
	queryOptions({
		queryKey: MONTHLY_BUDGETS_QUERY_KEYS.monthlyBudget(householdId, month),
		staleTime: 0,
		queryFn: async () => {
			const [error, data] = await to<MonthlyBudgetDetailResponse, FullErrorResult>(getMonthlyBudget(householdId, month))

			if (error) {
				throw error
			}

			return data
		},
	})
