'use server'

import type { FullErrorResult, ResponseResult } from '@lib/errors/types'

import { createAction } from '@lib/actions/action-builder'
import { withActiveMembership, withAuthorizedSession, withErrorBoundary, withOwnedResource } from '@lib/actions/middlewares'
import { INTERNAL_ERROR, OK } from '@lib/errors'
import { bankAccountLogger } from '@lib/logger'
import { prisma } from '@lib/prisma'
import { to } from '@lib/utils/to.utils'

const deleteBankAccountChain = createAction<{ bankAccountId: string }>()
	.use(withErrorBoundary(bankAccountLogger, '[deleteBankAccount]: {error}'))
	.use(withAuthorizedSession)
	.use(
		withOwnedResource(({ bankAccountId }) =>
			prisma.bankAccount.findUnique({ where: { id: bankAccountId }, select: { householdId: true, householdMemberId: true } }),
		),
	)
	.use(withActiveMembership((ctx) => ctx.resource.householdId, { requireOwner: (ctx) => ctx.resource.householdMemberId }))
	.handler(async ({ bankAccountId }): Promise<ResponseResult<{ deleted: true }, string>> => {
		const [deleteError] = await to(prisma.bankAccount.delete({ where: { id: bankAccountId } }))
		if (deleteError) return INTERNAL_ERROR(deleteError)

		return OK({ deleted: true })
	})

/**
 * Deletes a bank account. Restricted to its creator/owner. Linked payments keep their record
 * but lose the account reference (`onDelete: SetNull` in the schema).
 */
export async function deleteBankAccount(bankAccountId: string): Promise<ResponseResult<{ deleted: true }, string> | FullErrorResult> {
	return deleteBankAccountChain({ bankAccountId })
}
