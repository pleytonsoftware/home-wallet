import type { EmptyObject, LayoutProps } from '@/types/app'

import { getQueryClient } from '@lib/query/get-query-client'
import { MonthlyDetailPage } from '@monthly-budgets/components/monthly-detail-page'
import { getMonthlyBudgetOptions } from '@monthly-budgets/hooks/queries/get-monthly-budget-option'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

export default async function HouseholdTransactionsPersonalMonthPage({ params }: LayoutProps<EmptyObject, { id: string; month: string }>) {
	const { id, month } = await params
	const queryClient = getQueryClient()
	await queryClient.prefetchQuery(getMonthlyBudgetOptions(id, month))

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<MonthlyDetailPage month={month} />
		</HydrationBoundary>
	)
}
