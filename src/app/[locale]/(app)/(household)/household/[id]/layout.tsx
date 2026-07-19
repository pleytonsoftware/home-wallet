import { notFound, forbidden } from 'next/navigation'

import { isActiveMemberOf } from '@actions/household/active-memberships'
import { SidebarProvider, SidebarTrigger } from '@atoms/sidebar'
import { AppSidebar } from '@molecules/sidebar'

export default async function HouseholdDashboardLayout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
	const id = (await params).id

	const isActiveMember = await isActiveMemberOf({ householdId: id })

	if (!isActiveMember) {
		forbidden()
	}

	// TODO: Temporarily using `findFirstOrThrow`
	const household = await prisma?.household.findFirstOrThrow({
		where: { id },
		select: { name: true },
	})

	if (!household) {
		notFound()
	}

	const householdName = household.name

	return (
		<SidebarProvider>
			<AppSidebar householdName={householdName} />
			<main className='bg-background-2 w-full min-h-screen p-4'>
				<SidebarTrigger />
				{children}
			</main>
		</SidebarProvider>
	)
}
