'use server'

import type { FullErrorResult, ResponseResult } from '@lib/errors/types'

import { getTranslations } from 'next-intl/server'

import { getMemberRole, isAdminOf } from '@actions/household/active-memberships'
import { authorizedSession } from '@lib/auth/utils'
import { MemberRole, UserRole } from '@lib/constants/role.enum'
import { BAD_REQUEST, FORBIDDEN, INTERNAL_ERROR, OK } from '@lib/errors'
import { householdLogger } from '@lib/logger'
import { prisma } from '@lib/prisma'
import { DEFAULT_INVITE_CODE_LENGTH, generateInviteCode, isInviteCodeRegenerateOnCooldown } from '@lib/utils/invite-code.utils'
import { to } from '@lib/utils/to.utils'

/** Generates a fresh invite code for the household. Admin only, rate-limited unless the user is a global app admin. */
export async function regenerateInviteCode(householdId: string): Promise<ResponseResult<{ code: string }, string> | FullErrorResult> {
	try {
		const { session, error } = await authorizedSession()
		if (error) return error

		if (!(await isAdminOf({ userId: session.user.id, householdId }))) {
			return FORBIDDEN()
		}

		if (session.user.role !== UserRole.ADMIN) {
			const household = await prisma.household.findUnique({ where: { id: householdId }, select: { codeRegeneratedAt: true } })

			if (household && isInviteCodeRegenerateOnCooldown(household.codeRegeneratedAt)) {
				const dangerTrans = await getTranslations('settings.danger')
				return BAD_REQUEST(dangerTrans('regenerate-code.cooldown-error'))
			}
		}

		const code = generateInviteCode(DEFAULT_INVITE_CODE_LENGTH)
		const [updateError] = await to(
			prisma.household.update({
				where: { id: householdId },
				data: { code, codeRegeneratedAt: new Date() },
				select: { id: true },
			}),
		)

		if (updateError) return INTERNAL_ERROR(updateError)

		return OK({ code })
	} catch (error) {
		householdLogger.error('[regenerateInviteCode]: {error}', { error })
		return INTERNAL_ERROR(error)
	}
}

/** Removes the current user's membership. Blocks the last remaining admin from leaving. */
export async function leaveHousehold(householdId: string): Promise<ResponseResult<{ left: true }, string> | FullErrorResult> {
	try {
		const { session, error } = await authorizedSession()
		if (error) return error

		const dangerTrans = await getTranslations('settings.danger')

		const role = await getMemberRole({ userId: session.user.id, householdId })
		if (!role) {
			return FORBIDDEN()
		}

		if (role === MemberRole.ADMIN) {
			const adminCount = await prisma.householdMember.count({ where: { householdId, role: MemberRole.ADMIN } })
			if (adminCount <= 1) {
				return BAD_REQUEST(dangerTrans('leave.last-admin-error'))
			}
		}

		const [deleteError] = await to(prisma.householdMember.deleteMany({ where: { householdId, userId: session.user.id } }))
		if (deleteError) return INTERNAL_ERROR(deleteError)

		return OK({ left: true })
	} catch (error) {
		householdLogger.error('[leaveHousehold]: {error}', { error })
		return INTERNAL_ERROR(error)
	}
}

/** Permanently deletes a household and all of its data. Restricted to the creator (and admin). */
export async function deleteHousehold(
	householdId: string,
	confirmName: string,
): Promise<ResponseResult<{ deleted: true }, string> | FullErrorResult> {
	try {
		const { session, error } = await authorizedSession()
		if (error) return error

		const dangerTrans = await getTranslations('settings.danger')

		const household = await prisma.household.findUnique({ where: { id: householdId }, select: { name: true, createdById: true } })
		if (!household) {
			return FORBIDDEN()
		}

		// Only the creator (who is also an admin) can delete the household.
		if (household.createdById !== session.user.id || !(await isAdminOf({ userId: session.user.id, householdId }))) {
			return FORBIDDEN()
		}

		if (confirmName.trim() !== household.name) {
			return BAD_REQUEST(dangerTrans('delete.name-mismatch-error'))
		}

		// Delete dependent rows first (no cascade in the schema), innermost references outward.
		const [deleteError] = await to(
			prisma.$transaction([
				prisma.aISummary.deleteMany({ where: { householdId } }),
				prisma.payment.deleteMany({ where: { monthlyBudget: { householdId } } }),
				prisma.transaction.deleteMany({ where: { householdId } }),
				prisma.monthlyBudget.deleteMany({ where: { householdId } }),
				prisma.bankAccount.deleteMany({ where: { householdId } }),
				prisma.householdMemberPayroll.deleteMany({ where: { householdMember: { householdId } } }),
				prisma.tag.deleteMany({ where: { householdId } }),
				prisma.category.deleteMany({ where: { householdId } }),
				prisma.householdConfig.deleteMany({ where: { householdId } }),
				prisma.householdMember.deleteMany({ where: { householdId } }),
				prisma.household.delete({ where: { id: householdId } }),
			]),
		)

		if (deleteError) return INTERNAL_ERROR(deleteError)

		return OK({ deleted: true })
	} catch (error) {
		householdLogger.error('[deleteHousehold]: {error}', { error })
		return INTERNAL_ERROR(error)
	}
}
