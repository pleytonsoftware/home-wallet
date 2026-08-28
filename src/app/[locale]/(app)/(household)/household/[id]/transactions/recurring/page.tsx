import type { EmptyObject, LayoutProps } from '@/types/app'

import { getQueryClient } from '@lib/query/get-query-client'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'
import { RecurringSeriesPage } from '@transactions/components/recurring/recurring-series-page'
import { getRecurringSeriesOptions } from '@transactions/hooks/queries/get-recurring-series-option'

export default async function HouseholdTransactionsRecurringPage({ params }: LayoutProps<EmptyObject, { id: string }>) {
	const { id } = await params
	const queryClient = getQueryClient()
	await queryClient.prefetchQuery(getRecurringSeriesOptions(id))

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<RecurringSeriesPage />
		</HydrationBoundary>
	)
}
