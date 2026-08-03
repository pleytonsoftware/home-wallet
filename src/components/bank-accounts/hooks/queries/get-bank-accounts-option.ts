import type { BankAccountSummary } from '@bank-accounts/types'
import type { FullErrorResult } from '@lib/errors/types'

import { BANK_ACCOUNTS_API_PATHS } from '@bank-accounts/constants/api'
import { BANK_ACCOUNTS_QUERY_KEYS } from '@bank-accounts/constants/query-keys'
import { transformBankAccountSummary } from '@bank-accounts/transforms/bank-account'
import { getAxiosClient, getAxiosServerClient } from '@lib/query/api-client'
import { to } from '@lib/utils/to.utils'
import { environmentManager, queryOptions } from '@tanstack/react-query'

async function getBankAccounts(householdId: string) {
	const isServer = environmentManager.isServer()
	const client = isServer ? await getAxiosServerClient() : getAxiosClient()

	return client
		.get<BankAccountSummary[]>(BANK_ACCOUNTS_API_PATHS.GET_BANK_ACCOUNTS(householdId))
		.then((res) => res.data.map(transformBankAccountSummary))
}

export const getBankAccountsOptions = (householdId: string) =>
	queryOptions({
		queryKey: BANK_ACCOUNTS_QUERY_KEYS.bankAccounts(householdId),
		staleTime: 0,
		queryFn: async () => {
			const [error, data] = await to<BankAccountSummary[], FullErrorResult>(getBankAccounts(householdId))

			if (error) {
				throw error
			}

			return data
		},
	})
