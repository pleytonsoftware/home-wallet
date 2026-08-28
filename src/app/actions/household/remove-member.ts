'use server'

import type { FullErrorResult, ResponseResult } from '@lib/errors/types'

import { getTranslations } from 'next-intl/server'

import { getBankAccountTransferPlan, planToPrismaOps } from '@actions/bank-account/shared/transfer-plan'
import { createAction } from '@lib/actions/action-builder'
import { withActiveMembership, withAuthorizedSession, withErrorBoundary } from '@lib/actions/middlewares'
import { MemberRole, parseMemberRole } from '@lib/constants/role.enum'
import { BAD_REQUEST, FORBIDDEN, INTERNAL_ERROR, OK } from '@lib/errors'
import { householdLogger } from '@lib/logger'
import { prisma } from '@lib/prisma'
import { to } from '@lib/utils/to.utils'

const removeMemberChain = createAction<{ householdId: string; targetMembershipId: string }>()
	.use(withErrorBoundary(householdLogger, '[removeMember]: {error}'))
	.use(withAuthorizedSession)
	.use(withActiveMembership((ctx) => ctx.householdId, { requireAdmin: true }))
	.handler(async ({ householdId, targetMembershipId, membership }): Promise<ResponseResult<{ removed: true }, string>> => {
		const membersTrans = await getTranslations('settings.members')

		if (membership.id === targetMembershipId) {
			return BAD_REQUEST(membersTrans('remove.self-error'))
		}

		const target = await prisma.householdMember.findFirst({
			where: { id: targetMembershipId, householdId, removedAt: null },
			select: { id: true, role: true },
		})
		if (!target) return FORBIDDEN()

		if (parseMemberRole(target.role) === MemberRole.ADMIN) {
			const adminCount = await prisma.householdMember.count({ where: { householdId, role: MemberRole.ADMIN, removedAt: null } })
			if (adminCount <= 1) {
				return BAD_REQUEST(membersTrans('remove.last-admin-error'))
			}
		}

		const plan = await getBankAccountTransferPlan(target.id)
		const [updateError] = await to(
			prisma.$transaction([
				...planToPrismaOps(plan),
				prisma.householdMember.update({ where: { id: target.id }, data: { removedAt: new Date() } }),
			]),
		)
		if (updateError) return INTERNAL_ERROR(updateError)

		return OK({ removed: true })
	})

/**
 * Admin-only removal of another household member (soft delete). Use {@link leaveHousehold}
 * to remove yourself instead. Blocks removing the last remaining admin. Bank accounts the
 * target owns are transferred to another shared member or deleted, per {@link getBankAccountTransferPlan}.
 */
export async function removeMember(
	householdId: string,
	targetMembershipId: string,
): Promise<ResponseResult<{ removed: true }, string> | FullErrorResult> {
	return removeMemberChain({ householdId, targetMembershipId })
}
