import { auth } from '@lib/auth'
import { MemberRole, parseMemberRole } from '@lib/constants/role.enum'
import { prisma } from '@lib/prisma'

export const hasActiveMemberships = async (userId: string): Promise<boolean> => getActiveMembershipCount(userId).then((count) => count > 0)

export const getActiveMembershipCount = async (userId: string): Promise<number> =>
	prisma.householdMember.count({
		where: { userId, removedAt: null },
	})

export const getActiveMembershipsIds = async (userId: string) => {
	const membershipsIds = await prisma.householdMember.findMany({
		where: { userId, removedAt: null },
		select: { householdId: true },
	})
	return membershipsIds.flatMap((membership) => membership.householdId)
}

interface ActiveMembershipParams {
	userId?: string
	householdId: string
}

/**
 * Resolves the current (or given) user's active membership (id + role) within a household.
 * Returns `null` when the user is not a member, or was removed (`removedAt` is set).
 */
export const getActiveMembership = async ({ userId, householdId }: ActiveMembershipParams): Promise<{ id: string; role: MemberRole } | null> => {
	if (!userId) {
		const session = await auth<true>()
		userId = session.user.id
	}

	const membership = await prisma.householdMember.findFirst({
		where: { userId, householdId, removedAt: null },
		select: { id: true, role: true },
	})

	return membership ? { id: membership.id, role: parseMemberRole(membership.role) } : null
}

export const isActiveMemberOf = async (params: ActiveMembershipParams): Promise<boolean> => (await getActiveMembership(params)) !== null

/**
 * Resolves the current (or given) user's {@link MemberRole} within a household.
 * Returns `null` when the user is not an active member.
 */
export const getMemberRole = async (params: ActiveMembershipParams): Promise<MemberRole | null> => (await getActiveMembership(params))?.role ?? null

/** Whether the current (or given) user is an admin of the household. */
export const isAdminOf = async (params: ActiveMembershipParams): Promise<boolean> => (await getMemberRole(params)) === MemberRole.ADMIN
