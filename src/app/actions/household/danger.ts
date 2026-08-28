'use server'

import type { FullErrorResult, ResponseResult } from '@lib/errors/types'

import { getTranslations } from 'next-intl/server'

import { getBankAccountTransferPlan, planToPrismaOps, type BankAccountTransferPlanEntry } from '@actions/bank-account/shared/transfer-plan'
import { isAdminOf } from '@actions/household/active-memberships'
import { createAction } from '@lib/actions/action-builder'
import { withActiveMembership, withAuthorizedSession, withErrorBoundary } from '@lib/actions/middlewares'
import { MemberRole, UserRole } from '@lib/constants/role.enum'
import { BAD_REQUEST, FORBIDDEN, INTERNAL_ERROR, OK } from '@lib/errors'
import { householdLogger } from '@lib/logger'
import { prisma } from '@lib/prisma'
import { DEFAULT_INVITE_CODE_LENGTH, generateInviteCode, isInviteCodeRegenerateOnCooldown } from '@lib/utils/invite-code.utils'
import { to } from '@lib/utils/to.utils'

const regenerateInviteCodeChain = createAction<{ householdId: string }>()
	.use(withErrorBoundary(householdLogger, '[regenerateInviteCode]: {error}'))
	.use(withAuthorizedSession)
	.use(withActiveMembership((ctx) => ctx.householdId, { requireAdmin: true }))
	.handler(async ({ householdId, session }): Promise<ResponseResult<{ code: string }, string>> => {
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
	})

/** Generates a fresh invite code for the household. Admin only, rate-limited unless the user is a global app admin. */
export async function regenerateInviteCode(householdId: string): Promise<ResponseResult<{ code: string }, string> | FullErrorResult> {
	return regenerateInviteCodeChain({ householdId })
}

const getLeaveHouseholdImpactChain = createAction<{ householdId: string }>()
	.use(withErrorBoundary(householdLogger, '[getLeaveHouseholdImpact]: {error}'))
	.use(withAuthorizedSession)
	.use(withActiveMembership((ctx) => ctx.householdId))
	.handler(
		async ({ membership }): Promise<ResponseResult<BankAccountTransferPlanEntry[], string>> =>
			OK(await getBankAccountTransferPlan(membership.id)),
	)

/**
 * Previews what leaving the household would do to the current user's owned bank accounts
 * (transferred to another shared member, or deleted if not shared with anyone else).
 */
export async function getLeaveHouseholdImpact(
	householdId: string,
): Promise<ResponseResult<BankAccountTransferPlanEntry[], string> | FullErrorResult> {
	return getLeaveHouseholdImpactChain({ householdId })
}

const leaveHouseholdChain = createAction<{ householdId: string }>()
	.use(withErrorBoundary(householdLogger, '[leaveHousehold]: {error}'))
	.use(withAuthorizedSession)
	.use(withActiveMembership((ctx) => ctx.householdId))
	.handler(async ({ householdId, membership }): Promise<ResponseResult<{ left: true }, string>> => {
		const dangerTrans = await getTranslations('settings.danger')

		if (membership.role === MemberRole.ADMIN) {
			const adminCount = await prisma.householdMember.count({ where: { householdId, role: MemberRole.ADMIN, removedAt: null } })
			if (adminCount <= 1) {
				return BAD_REQUEST(dangerTrans('leave.last-admin-error'))
			}
		}

		const plan = await getBankAccountTransferPlan(membership.id)
		const [updateError] = await to(
			prisma.$transaction([
				...planToPrismaOps(plan),
				prisma.householdMember.update({ where: { id: membership.id }, data: { removedAt: new Date() } }),
			]),
		)
		if (updateError) return INTERNAL_ERROR(updateError)

		return OK({ left: true })
	})

/**
 * Deactivates the current user's membership (soft delete). Blocks the last remaining admin
 * from leaving. Bank accounts they own are transferred to another shared member or deleted,
 * per {@link getBankAccountTransferPlan}.
 */
export async function leaveHousehold(householdId: string): Promise<ResponseResult<{ left: true }, string> | FullErrorResult> {
	return leaveHouseholdChain({ householdId })
}

const deleteHouseholdChain = createAction<{ householdId: string; confirmName: string }>()
	.use(withErrorBoundary(householdLogger, '[deleteHousehold]: {error}'))
	.use(withAuthorizedSession)
	.handler(async ({ householdId, confirmName, session }): Promise<ResponseResult<{ deleted: true }, string>> => {
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
	})

/** Permanently deletes a household and all of its data. Restricted to the creator (and admin). */
export async function deleteHousehold(
	householdId: string,
	confirmName: string,
): Promise<ResponseResult<{ deleted: true }, string> | FullErrorResult> {
	return deleteHouseholdChain({ householdId, confirmName })
}
