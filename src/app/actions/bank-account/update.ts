'use server'

import type { FullErrorResult, ResponseResult } from '@lib/errors/types'
import type { $ZodIssue } from 'zod/v4/core'

import { getTranslations } from 'next-intl/server'

import { getActiveMembership } from '@actions/household/active-memberships'
import { authorizedSession } from '@lib/auth/utils'
import { BAD_REQUEST, FORBIDDEN, INTERNAL_ERROR, OK } from '@lib/errors'
import { bankAccountLogger } from '@lib/logger'
import { prisma } from '@lib/prisma'
import { updateBankAccountSchema, type UpdateBankAccountInput } from '@lib/schemas/bank-account/update-bank-account'
import { to } from '@lib/utils/to.utils'

export type UpdateBankAccountResult = ResponseResult<{ id: string }, $ZodIssue[] | string>

/** Updates a bank account. Restricted to its creator/owner. */
export async function updateBankAccount(bankAccountId: string, input: UpdateBankAccountInput): Promise<UpdateBankAccountResult | FullErrorResult> {
	try {
		const { session, error } = await authorizedSession()
		if (error) return error

		const bankAccount = await prisma.bankAccount.findUnique({
			where: { id: bankAccountId },
			select: { householdId: true, householdMemberId: true },
		})
		if (!bankAccount) return FORBIDDEN()

		const membership = await getActiveMembership({ userId: session.user.id, householdId: bankAccount.householdId })
		if (!membership || membership.id !== bankAccount.householdMemberId) return FORBIDDEN()

		const t = await getTranslations('common.forms.bank-accounts.create')
		const validation = await updateBankAccountSchema(t).safeParseAsync(input)
		if (!validation.success) return BAD_REQUEST(validation.error.issues)

		const { name, type, lastFourDigits, sharedMemberIds } = validation.data
		const uniqueSharedIds = [...new Set(sharedMemberIds)].filter((id) => id !== membership.id)

		if (uniqueSharedIds.length > 0) {
			const validMembersCount = await prisma.householdMember.count({
				where: { id: { in: uniqueSharedIds }, householdId: bankAccount.householdId, removedAt: null },
			})
			if (validMembersCount !== uniqueSharedIds.length) {
				return BAD_REQUEST(t('shared-members.error.invalid'))
			}
		}

		const [updateError] = await to(
			prisma.$transaction([
				prisma.bankAccount.update({
					where: { id: bankAccountId },
					data: { name: name.trim(), type, lastFourDigits: lastFourDigits || null },
				}),
				prisma.bankAccountMember.deleteMany({ where: { bankAccountId, householdMemberId: { notIn: uniqueSharedIds } } }),
				prisma.bankAccountMember.createMany({
					data: uniqueSharedIds.map((id) => ({ bankAccountId, householdMemberId: id })),
					skipDuplicates: true,
				}),
			]),
		)

		if (updateError) return INTERNAL_ERROR(updateError)

		return OK({ id: bankAccountId })
	} catch (error) {
		bankAccountLogger.error('[updateBankAccount]: {error}', { error })
		return INTERNAL_ERROR(error)
	}
}
