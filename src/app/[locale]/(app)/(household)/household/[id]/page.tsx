import { authorizedSession } from '@/lib/auth/utils'
import { MemberRole } from '@/lib/constants/role.enum'
import { logger } from '@/lib/logger'

import { redirect } from 'next/navigation'

import { ROUTES } from '@lib/constants/routes.const'
import { prisma } from '@lib/prisma'

export default async function HouseholdPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
	const { session } = await authorizedSession()

	const householdId = (await params).id

	// TODO: Temporarily using `findFirstOrThrow` to check if the household exists and if the user is a member of it. This should be replaced moved to a more appropriate place, for reusability and to avoid code duplication.
	const isAdminHouseholdMember =
		(await prisma.householdMember.count({
			where: {
				householdId,
				role: MemberRole.ADMIN,
			},
		})) > 0

	const household = await prisma.household.findFirst({
		where: {
			id: householdId,
		},
		include: {
			config: true,
		},
		omit: {
			code: isAdminHouseholdMember,
		},
	})

	if (!household) {
		logger.error(`Household with ID ${householdId} not found for user ${session!.user.id}`)
		redirect(ROUTES.HOUSEHOLDS)
	}

	return (
		<div>
			<h2>Household: {household?.name}</h2>
			{household?.code && <p>Code: {household?.code}</p>}

			<div>
				<h3>Config</h3>
				<p>Currency: {household?.config?.currency}</p>
				<p>Split Strategy: {household?.config?.defaultSplitStrategy}</p>
			</div>
		</div>
	)
}
