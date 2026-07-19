import { auth } from '@lib/auth'
import { prisma } from '@lib/prisma'

export const hasActiveMemberships = async (userId: string): Promise<boolean> => getActiveMembershipCount(userId).then((count) => count > 0)

export const getActiveMembershipCount = async (userId: string): Promise<number> =>
	prisma.householdMember.count({
		where: { userId },
	})

export const getActiveMembershipsIds = async (userId: string) => {
	const membershipsIds = await prisma.householdMember.findMany({
		where: { userId },
		select: { householdId: true },
	})
	return membershipsIds.flatMap((membership) => membership.householdId)
}

interface IsActiveMemberOfParams {
	userId?: string
	householdId: string
}
export const isActiveMemberOf = async ({ userId, householdId }: IsActiveMemberOfParams): Promise<boolean> => {
	if (!userId) {
		const session = await auth<true>()
		userId = session.user.id
	}

	return prisma.householdMember
		.count({
			where: { userId, householdId },
		})
		.then((membership) => typeof membership === 'number' && membership > 0)
}
