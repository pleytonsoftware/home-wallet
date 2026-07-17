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
