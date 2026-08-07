import type { EmptyObject, LayoutProps } from '@/types/app'

import { getQueryClient } from '@lib/query/get-query-client'
import { MonthSelectionPage } from '@monthly-budgets/components/month-selection-page'
import { getMonthlyBudgetsOptions } from '@monthly-budgets/hooks/queries/get-monthly-budgets-option'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

export default async function HouseholdTransactionsPersonalPage({ params }: LayoutProps<EmptyObject, { id: string }>) {
	const { id } = await params
	const queryClient = getQueryClient()
	await queryClient.prefetchQuery(getMonthlyBudgetsOptions(id, new Date().getFullYear()))

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<MonthSelectionPage />
		</HydrationBoundary>
	)
}
