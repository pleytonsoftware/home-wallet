'use server'

import type { FullErrorResult, ResponseResult } from '@lib/errors/types'
import type { $ZodIssue } from 'zod/v4/core'

import { getTranslations } from 'next-intl/server'

import { createAction } from '@lib/actions/action-builder'
import { withActiveMembership, withAuthorizedSession, withErrorBoundary, withOwnedResource } from '@lib/actions/middlewares'
import { BAD_REQUEST, INTERNAL_ERROR, OK } from '@lib/errors'
import { bankAccountLogger } from '@lib/logger'
import { prisma } from '@lib/prisma'
import { updateBankAccountSchema, type UpdateBankAccountInput } from '@lib/schemas/bank-account/update-bank-account'
import { to } from '@lib/utils/to.utils'

export type UpdateBankAccountResult = ResponseResult<{ id: string }, $ZodIssue[] | string>

const updateBankAccountChain = createAction<{ bankAccountId: string; input: UpdateBankAccountInput }>()
	.use(withErrorBoundary(bankAccountLogger, '[updateBankAccount]: {error}'))
	.use(withAuthorizedSession)
	.use(
		withOwnedResource(({ bankAccountId }) =>
			prisma.bankAccount.findUnique({ where: { id: bankAccountId }, select: { householdId: true, householdMemberId: true } }),
		),
	)
	.use(withActiveMembership((ctx) => ctx.resource.householdId, { requireOwner: (ctx) => ctx.resource.householdMemberId }))
	.handler(async ({ bankAccountId, input, resource, membership }): Promise<UpdateBankAccountResult> => {
		const t = await getTranslations('common.forms.bank-accounts.create')
		const validation = await updateBankAccountSchema(t).safeParseAsync(input)
		if (!validation.success) return BAD_REQUEST(validation.error.issues)

		const { name, type, lastFourDigits, sharedMemberIds } = validation.data
		const uniqueSharedIds = [...new Set(sharedMemberIds)].filter((id) => id !== membership.id)

		if (uniqueSharedIds.length > 0) {
			const validMembersCount = await prisma.householdMember.count({
				where: { id: { in: uniqueSharedIds }, householdId: resource.householdId, removedAt: null },
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
	})

/** Updates a bank account. Restricted to its creator/owner. */
export async function updateBankAccount(bankAccountId: string, input: UpdateBankAccountInput): Promise<UpdateBankAccountResult | FullErrorResult> {
	return updateBankAccountChain({ bankAccountId, input })
}
