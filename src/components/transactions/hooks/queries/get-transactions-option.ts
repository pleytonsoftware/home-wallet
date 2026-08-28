import type { FullErrorResult } from '@lib/errors/types'
import type { TransactionSummary } from '@transactions/types'

import { getAxiosClient, getAxiosServerClient } from '@lib/query/api-client'
import { to } from '@lib/utils/to.utils'
import { environmentManager, queryOptions } from '@tanstack/react-query'
import { TRANSACTIONS_API_PATHS } from '@transactions/constants/api'
import { TRANSACTIONS_QUERY_KEYS } from '@transactions/constants/query-keys'
import { transformTransactionSummary } from '@transactions/transforms/transaction'

async function getTransactions(householdId: string, monthlyBudgetId: string) {
	const isServer = environmentManager.isServer()
	const client = isServer ? await getAxiosServerClient() : getAxiosClient()

	return client
		.get<Array<TransactionSummary>>(TRANSACTIONS_API_PATHS.GET_TRANSACTIONS(householdId, monthlyBudgetId))
		.then((res) => res.data.map(transformTransactionSummary))
}

export const getTransactionsOptions = (householdId: string, monthlyBudgetId: string) =>
	queryOptions({
		queryKey: TRANSACTIONS_QUERY_KEYS.transactions(householdId, monthlyBudgetId),
		staleTime: 0,
		queryFn: async () => {
			const [error, data] = await to<Array<TransactionSummary>, FullErrorResult>(getTransactions(householdId, monthlyBudgetId))

			if (error) {
				throw error
			}

			return data
		},
	})
