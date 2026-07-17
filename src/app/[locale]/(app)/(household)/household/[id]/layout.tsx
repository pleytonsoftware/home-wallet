import { notFound } from 'next/navigation'

import { SidebarProvider, SidebarTrigger } from '@atoms/sidebar'
import { AppSidebar } from '@molecules/sidebar'

export default async function HouseholdDashboardLayout({ children, params }: { children: React.ReactNode; params: Promise<{ id: string }> }) {
	// TODO: Temporarily using `findFirstOrThrow`
	const household = await prisma?.household.findFirstOrThrow({
		where: { id: (await params).id },
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
