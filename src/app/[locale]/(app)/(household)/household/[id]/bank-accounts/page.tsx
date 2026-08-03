import type { EmptyObject, LayoutProps } from '@/types/app'

import { BankAccountsPage } from '@bank-accounts/bank-accounts-page'
import { getBankAccountsOptions } from '@bank-accounts/hooks/queries/get-bank-accounts-option'
import { getQueryClient } from '@lib/query/get-query-client'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

export default async function HouseholdBankAccountsPage({ params }: LayoutProps<EmptyObject, { id: string }>) {
	const { id } = await params
	const queryClient = getQueryClient()
	await queryClient.prefetchQuery(getBankAccountsOptions(id))

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<BankAccountsPage />
		</HydrationBoundary>
	)
}
