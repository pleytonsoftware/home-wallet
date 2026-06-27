import { redirect } from 'next/navigation'

import { auth } from '@lib/auth'
import { ROUTES } from '@lib/constants/routes.const'
import { prisma } from '@lib/prisma'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
	const session = await auth()

	if (!session?.user?.id) {
		redirect(ROUTES.SIGNIN)
	}

	// Check if user has any household memberships
	const memberships = await prisma.householdMember.findMany({
		where: { userId: session.user.id },
	})

	if (memberships.length === 0) {
		redirect(ROUTES.ONBOARDING.HOUSEHOLD)
	}

	return <>{children}</>
}
