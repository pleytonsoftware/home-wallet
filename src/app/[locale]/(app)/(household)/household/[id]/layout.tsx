import type { LayoutProps } from '@/types/app'
import type { PropsWithChildren } from 'react'

import { cookies } from 'next/headers'
import { forbidden } from 'next/navigation'

import { isActiveMemberOf } from '@actions/household/active-memberships'
import { SidebarProvider, SidebarTrigger } from '@atoms/sidebar'
import { SIDEBAR_COOKIE_NAME } from '@common/constants/sidebar.constant'
import { HouseholdContextProvider } from '@households/context/household-provider'
import { getHouseholdOptions } from '@households/hooks/queries/get-household-option'
import { getQueryClient } from '@lib/query/get-query-client'
import { AppSidebar } from '@molecules/sidebar'
import { dehydrate, HydrationBoundary } from '@tanstack/react-query'

export default async function HouseholdDashboardLayout({ children, params }: LayoutProps<PropsWithChildren, { id: string }>) {
	const id = (await params).id
	const isActiveMember = await isActiveMemberOf({ householdId: id })

	if (!isActiveMember) {
		forbidden()
	}

	const queryClient = getQueryClient()
	const household = await queryClient.fetchQuery(getHouseholdOptions(id))
	const cookieStore = await cookies()
	const defaultOpen = cookieStore.get(SIDEBAR_COOKIE_NAME)?.value !== 'false'

	return (
		<HydrationBoundary state={dehydrate(queryClient)}>
			<HouseholdContextProvider id={id} initialData={household}>
				<SidebarProvider defaultOpen={defaultOpen}>
					<AppSidebar />
					<main className='bg-background-2 w-full min-h-screen p-4'>
						<SidebarTrigger />
						{children}
					</main>
				</SidebarProvider>
			</HouseholdContextProvider>
		</HydrationBoundary>
	)
}
