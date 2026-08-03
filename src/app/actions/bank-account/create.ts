'use server'

import type { FullErrorResult, ResponseResult } from '@lib/errors/types'
import type { Prisma } from '@lib/prisma'
import type { $ZodIssue } from 'zod/v4/core'

import { getTranslations } from 'next-intl/server'

import { getActiveMembership } from '@actions/household/active-memberships'
import { authorizedSession } from '@lib/auth/utils'
import { BAD_REQUEST, CREATED, FORBIDDEN, INTERNAL_ERROR } from '@lib/errors'
import { bankAccountLogger } from '@lib/logger'
import { prisma } from '@lib/prisma'
import { createBankAccountSchema, type CreateBankAccountInput } from '@lib/schemas/bank-account/create-bank-account'
import { to } from '@lib/utils/to.utils'

type BankAccountWithShares = Prisma.BankAccountGetPayload<{ include: { sharedWith: true } }>
export type CreateBankAccountResult = ResponseResult<BankAccountWithShares, $ZodIssue[] | string>

/** Creates a bank account owned by the requester. `sharedMemberIds` must belong to the same household. */
export async function createBankAccount(householdId: string, input: CreateBankAccountInput): Promise<CreateBankAccountResult | FullErrorResult> {
	try {
		const { session, error } = await authorizedSession()
		if (error) return error

		const membership = await getActiveMembership({ userId: session.user.id, householdId })
		if (!membership) return FORBIDDEN()

		const t = await getTranslations('common.forms.bank-accounts.create')
		const validation = await createBankAccountSchema(t).safeParseAsync(input)
		if (!validation.success) return BAD_REQUEST(validation.error.issues)

		const { name, type, lastFourDigits, sharedMemberIds } = validation.data
		const uniqueSharedIds = [...new Set(sharedMemberIds)].filter((id) => id !== membership.id)

		if (uniqueSharedIds.length > 0) {
			const validMembersCount = await prisma.householdMember.count({
				where: { id: { in: uniqueSharedIds }, householdId, removedAt: null },
			})
			if (validMembersCount !== uniqueSharedIds.length) {
				return BAD_REQUEST(t('shared-members.error.invalid'))
			}
		}

		const [createError, bankAccount] = await to(
			prisma.bankAccount.create({
				data: {
					householdId,
					householdMemberId: membership.id,
					name: name.trim(),
					type,
					lastFourDigits: lastFourDigits || null,
					sharedWith: { create: uniqueSharedIds.map((id) => ({ householdMemberId: id })) },
				},
				include: { sharedWith: true },
			}),
		)

		if (createError) return INTERNAL_ERROR(createError)

		return CREATED(bankAccount)
	} catch (error) {
		bankAccountLogger.error('[createBankAccount]: {error}', { error })
		return INTERNAL_ERROR(error)
	}
}
