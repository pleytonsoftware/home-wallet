'use server'

import type { FullErrorResult, ResponseResult } from '@lib/errors/types'

import { isAdminOf } from '@actions/household/active-memberships'
import { authorizedSession } from '@lib/auth/utils'
import { FORBIDDEN, INTERNAL_ERROR, OK } from '@lib/errors'
import { householdLogger } from '@lib/logger'
import { prisma } from '@lib/prisma'
import { to } from '@lib/utils/to.utils'

/**
 * Admin-only permanent purge of an already-removed (soft-deleted) household member.
 * Relies on the schema's `onDelete` rules to null out or cascade every dependent row
 * (payments, budgets, payroll, bank-account shares) — no manual cleanup needed here.
 */
export async function hardDeletePreviousMember(
	householdId: string,
	targetMembershipId: string,
): Promise<ResponseResult<{ deleted: true }, string> | FullErrorResult> {
	try {
		const { session, error } = await authorizedSession()
		if (error) return error

		if (!(await isAdminOf({ userId: session.user.id, householdId }))) {
			return FORBIDDEN()
		}

		const target = await prisma.householdMember.findFirst({
			where: { id: targetMembershipId, householdId, removedAt: { not: null } },
			select: { id: true },
		})
		if (!target) return FORBIDDEN()

		const [deleteError] = await to(prisma.householdMember.delete({ where: { id: target.id } }))
		if (deleteError) return INTERNAL_ERROR(deleteError)

		return OK({ deleted: true })
	} catch (error) {
		householdLogger.error('[hardDeletePreviousMember]: {error}', { error })
		return INTERNAL_ERROR(error)
	}
}
