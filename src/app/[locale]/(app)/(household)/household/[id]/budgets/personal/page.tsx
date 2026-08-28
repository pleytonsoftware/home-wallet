import type { EmptyObject, LayoutProps } from '@/types/app'
import type { MonthSelectionView } from '@monthly-budgets/components/view-toggle'

import { cookies } from 'next/headers'

import { getQueryClient } from '@lib/query/get-query-client'
import { MonthSelectionPage } from '@monthly-budgets/components/month-selection-page'
import { MONTH_SELECTION_VIEW_COOKIE_NAME } from '@monthly-budgets/constants/view'
import { getMonthlyBudgetsOptions } from '@monthly-budgets/hooks/queries/get-monthly-budgets-option'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

export default async function HouseholdBudgetsPersonalPage({ params }: LayoutProps<EmptyObject, { id: string }>) {
	const { id } = await params
	const queryClient = getQueryClient()
	await queryClient.prefetchQuery(getMonthlyBudgetsOptions(id, new Date().getFullYear()))

	const cookieStore = await cookies()
	const initialView: MonthSelectionView = cookieStore.get(MONTH_SELECTION_VIEW_COOKIE_NAME)?.value === 'list' ? 'list' : 'grid'

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<MonthSelectionPage initialView={initialView} />
		</HydrationBoundary>
	)
}
