'use server'

import type { FullErrorResult, ResponseResult } from '@lib/errors/types'

import { createAction } from '@lib/actions/action-builder'
import { withActiveMembership, withAuthorizedSession, withErrorBoundary } from '@lib/actions/middlewares'
import { FORBIDDEN, INTERNAL_ERROR, OK } from '@lib/errors'
import { householdLogger } from '@lib/logger'
import { prisma } from '@lib/prisma'
import { to } from '@lib/utils/to.utils'

const hardDeletePreviousMemberChain = createAction<{ householdId: string; targetMembershipId: string }>()
	.use(withErrorBoundary(householdLogger, '[hardDeletePreviousMember]: {error}'))
	.use(withAuthorizedSession)
	.use(withActiveMembership((ctx) => ctx.householdId, { requireAdmin: true }))
	.handler(async ({ householdId, targetMembershipId }): Promise<ResponseResult<{ deleted: true }, string>> => {
		const target = await prisma.householdMember.findFirst({
			where: { id: targetMembershipId, householdId, removedAt: { not: null } },
			select: { id: true },
		})
		if (!target) return FORBIDDEN()

		const [deleteError] = await to(prisma.householdMember.delete({ where: { id: target.id } }))
		if (deleteError) return INTERNAL_ERROR(deleteError)

		return OK({ deleted: true })
	})

/**
 * Admin-only permanent purge of an already-removed (soft-deleted) household member.
 * Relies on the schema's `onDelete` rules to null out or cascade every dependent row
 * (payments, budgets, payroll, bank-account shares) — no manual cleanup needed here.
 */
export async function hardDeletePreviousMember(
	householdId: string,
	targetMembershipId: string,
): Promise<ResponseResult<{ deleted: true }, string> | FullErrorResult> {
	return hardDeletePreviousMemberChain({ householdId, targetMembershipId })
}
