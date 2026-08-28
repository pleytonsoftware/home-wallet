'use server'

import type { FullErrorResult, ResponseResult } from '@lib/errors/types'
import type { RecurrenceRule } from '@transactions/types'

import { cancelRecurringSeries } from '@actions/transaction/recurrence-materialization'
import { createAction } from '@lib/actions/action-builder'
import { withActiveMembership, withAuthorizedSession, withErrorBoundary, withOwnedResource } from '@lib/actions/middlewares'
import { INTERNAL_ERROR, OK } from '@lib/errors'
import { transactionLogger } from '@lib/logger'
import { prisma } from '@lib/prisma'
import { to } from '@lib/utils/to.utils'

interface DeleteTransactionOptions {
	/** Also stops the recurring series this transaction belongs to from ever being carried forward again. */
	cancelSeries?: boolean
}

const deleteTransactionChain = createAction<{ transactionId: string; options?: DeleteTransactionOptions }>()
	.use(withErrorBoundary(transactionLogger, '[deleteTransaction]: {error}'))
	.use(withAuthorizedSession)
	.use(
		withOwnedResource(({ transactionId }) =>
			prisma.transaction.findUnique({
				where: { id: transactionId },
				select: { householdId: true, householdMemberId: true, recurrenceRule: true },
			}),
		),
	)
	.use(withActiveMembership((ctx) => ctx.resource.householdId, { requireOwner: (ctx) => ctx.resource.householdMemberId }))
	.handler(async ({ transactionId, options, resource: transaction, membership }): Promise<ResponseResult<{ deleted: true }, string>> => {
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
	})

/** Deletes a personal transaction. Restricted to its creator/owner. */
export async function deleteTransaction(
	transactionId: string,
	options?: DeleteTransactionOptions,
): Promise<ResponseResult<{ deleted: true }, string> | FullErrorResult> {
	return deleteTransactionChain({ transactionId, options })
}
