import { getHouseholdsOptions } from '@households/hooks/queries/get-households-option'
import { HouseholdsPage } from '@households/households-page'
import { getQueryClient } from '@lib/query/get-query-client'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

const queryClient = getQueryClient()

export default async function DashboardPage() {
	const households = await queryClient.fetchQuery(getHouseholdsOptions())

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<HouseholdsPage households={households} />
		</HydrationBoundary>
	)
}
