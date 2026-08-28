'use server'

import type { FullErrorResult, ResponseResult } from '@lib/errors/types'
import type { RecurrenceRule } from '@transactions/types'

import { getActiveMembership } from '@actions/household/active-memberships'
import { cancelRecurringSeries } from '@actions/transaction/recurrence-materialization'
import { authorizedSession } from '@lib/auth/utils'
import { FORBIDDEN, INTERNAL_ERROR, OK } from '@lib/errors'
import { transactionLogger } from '@lib/logger'
import { prisma } from '@lib/prisma'
import { to } from '@lib/utils/to.utils'

interface DeleteTransactionOptions {
	/** Also stops the recurring series this transaction belongs to from ever being carried forward again. */
	cancelSeries?: boolean
}

/** Deletes a personal transaction. Restricted to its creator/owner. */
export async function deleteTransaction(
	transactionId: string,
	options?: DeleteTransactionOptions,
): Promise<ResponseResult<{ deleted: true }, string> | FullErrorResult> {
	try {
		const { session, error } = await authorizedSession()
		if (error) return error

		const transaction = await prisma.transaction.findUnique({
			where: { id: transactionId },
			select: { householdId: true, householdMemberId: true, recurrenceRule: true },
		})
		if (!transaction) return FORBIDDEN()

		const membership = await getActiveMembership({ userId: session.user.id, householdId: transaction.householdId })
		if (!membership || membership.id !== transaction.householdMemberId) return FORBIDDEN()

		const seriesId = (transaction.recurrenceRule as RecurrenceRule | null)?.seriesId

		const [deleteError] = await to(
			prisma.$transaction(async (tx) => {
				await tx.transaction.delete({ where: { id: transactionId } })

				if (options?.cancelSeries && seriesId) {
					await cancelRecurringSeries(tx, { householdMemberId: membership.id, seriesId })
				}
			}),
		)
		if (deleteError) return INTERNAL_ERROR(deleteError)

		return OK({ deleted: true })
	} catch (error) {
		transactionLogger.error('[deleteTransaction]: {error}', { error })
		return INTERNAL_ERROR(error)
	}
}
