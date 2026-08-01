import { auth } from '@lib/auth'
import { MemberRole, parseMemberRole } from '@lib/constants/role.enum'
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

interface MemberRoleParams {
	userId?: string
	householdId: string
}

/**
 * Resolves the current (or given) user's {@link MemberRole} within a household.
 * Returns `null` when the user is not a member.
 */
export const getMemberRole = async ({ userId, householdId }: MemberRoleParams): Promise<MemberRole | null> => {
	if (!userId) {
		const session = await auth<true>()
		userId = session.user.id
	}

	const membership = await prisma.householdMember.findFirst({
		where: { userId, householdId },
		select: { role: true },
	})

	return membership ? parseMemberRole(membership.role) : null
}

/** Whether the current (or given) user is an admin of the household. */
export const isAdminOf = async (params: MemberRoleParams): Promise<boolean> => (await getMemberRole(params)) === MemberRole.ADMIN
