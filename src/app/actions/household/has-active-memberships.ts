import { prisma } from '@lib/prisma'

export const hasActiveMemberships = async (userId: string): Promise<boolean> => {
	const count = await prisma.householdMember.count({
		where: { userId },
	})
	return count > 0
}
