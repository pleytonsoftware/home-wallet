'use server'

import type { FullErrorResult, ResponseResult } from '@lib/errors/types'

import { getTranslations } from 'next-intl/server'

import { createAction } from '@lib/actions/action-builder'
import { withActiveMembership, withAuthorizedSession, withErrorBoundary } from '@lib/actions/middlewares'
import { MemberRole, parseMemberRole } from '@lib/constants/role.enum'
import { BAD_REQUEST, INTERNAL_ERROR, OK } from '@lib/errors'
import { householdLogger } from '@lib/logger'
import { prisma } from '@lib/prisma'
import { to } from '@lib/utils/to.utils'

export type UpdateMemberRolesResult = ResponseResult<{ updated: number }, string>

const updateMemberRolesChain = createAction<{ householdId: string; roles: Record<string, MemberRole> }>()
	.use(withErrorBoundary(householdLogger, '[updateMemberRoles]: {error}'))
	.use(withAuthorizedSession)
	.use(withActiveMembership((ctx) => ctx.householdId, { requireAdmin: true }))
	.handler(async ({ householdId, roles }): Promise<UpdateMemberRolesResult> => {
		const rolesTrans = await getTranslations('settings.members')

		const members = await prisma.householdMember.findMany({
			where: { householdId, removedAt: null },
			select: { id: true, role: true },
		})

		// Resolve the final role for every member (requested override falls back to current).
		const finalRoles = new Map(members.map((member) => [member.id, roles[member.id] ?? parseMemberRole(member.role)]))

		// Reject ids that are not members of this household.
		if (Object.keys(roles).some((memberId) => !finalRoles.has(memberId))) {
			return BAD_REQUEST(rolesTrans('unknown-member-error'))
		}

		const adminCount = [...finalRoles.values()].filter((role) => role === MemberRole.ADMIN).length
		if (adminCount === 0) {
			return BAD_REQUEST(rolesTrans('last-admin-error'))
		}

		// Only write members whose role actually changes.
		const changes = members
			.filter((member) => parseMemberRole(member.role) !== finalRoles.get(member.id))
			.map((member) => ({ id: member.id, role: finalRoles.get(member.id)! }))

		const [updateError] = await to(
			prisma.$transaction(changes.map((change) => prisma.householdMember.update({ where: { id: change.id }, data: { role: change.role } }))),
		)

		if (updateError) {
			return INTERNAL_ERROR(updateError)
		}

		return OK({ updated: changes.length })
	})

/**
 * Updates household member roles from a `{ memberId -> role }` map.
 * Admin-gated, scoped to the household's own members, and refuses to leave the household
 * without at least one admin.
 */
export async function updateMemberRoles(householdId: string, roles: Record<string, MemberRole>): Promise<UpdateMemberRolesResult | FullErrorResult> {
	return updateMemberRolesChain({ householdId, roles })
}
