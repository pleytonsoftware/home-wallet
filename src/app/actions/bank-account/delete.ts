'use server'

import type { FullErrorResult, ResponseResult } from '@lib/errors/types'

import { getActiveMembership } from '@actions/household/active-memberships'
import { authorizedSession } from '@lib/auth/utils'
import { FORBIDDEN, INTERNAL_ERROR, OK } from '@lib/errors'
import { bankAccountLogger } from '@lib/logger'
import { prisma } from '@lib/prisma'
import { to } from '@lib/utils/to.utils'

/**
 * Deletes a bank account. Restricted to its creator/owner. Linked payments keep their record
 * but lose the account reference (`onDelete: SetNull` in the schema).
 */
export async function deleteBankAccount(bankAccountId: string): Promise<ResponseResult<{ deleted: true }, string> | FullErrorResult> {
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

		const [deleteError] = await to(prisma.bankAccount.delete({ where: { id: bankAccountId } }))
		if (deleteError) return INTERNAL_ERROR(deleteError)

		return OK({ deleted: true })
	} catch (error) {
		bankAccountLogger.error('[deleteBankAccount]: {error}', { error })
		return INTERNAL_ERROR(error)
	}
}
