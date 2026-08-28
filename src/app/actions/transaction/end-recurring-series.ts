'use server'

import type { FullErrorResult, ResponseResult } from '@lib/errors/types'

import { cancelRecurringSeries } from '@actions/transaction/recurrence-materialization'
import { createAction } from '@lib/actions/action-builder'
import { withActiveMembership, withAuthorizedSession, withErrorBoundary, withOwnedResource } from '@lib/actions/middlewares'
import { INTERNAL_ERROR, OK } from '@lib/errors'
import { transactionLogger } from '@lib/logger'
import { prisma } from '@lib/prisma'
import { to } from '@lib/utils/to.utils'

const endRecurringSeriesChain = createAction<{ seriesId: string }>()
	.use(withErrorBoundary(transactionLogger, '[endRecurringSeries]: {error}'))
	.use(withAuthorizedSession)
	.use(
		withOwnedResource(({ seriesId }) =>
			prisma.transaction.findFirst({
				where: { recurrenceRule: { path: ['seriesId'], equals: seriesId } },
				select: { householdId: true, householdMemberId: true },
			}),
		),
	)
	.use(withActiveMembership((ctx) => ctx.resource.householdId, { requireOwner: (ctx) => ctx.resource.householdMemberId }))
	.handler(async ({ seriesId, membership }): Promise<ResponseResult<{ ended: true }, string>> => {
		const [cancelError] = await to(cancelRecurringSeries(prisma, { householdMemberId: membership.id, seriesId }))
		if (cancelError) return INTERNAL_ERROR(cancelError)

		return OK({ ended: true })
	})

/** Stops a recurring series from ever being carried forward again, without deleting any existing occurrence. */
export async function endRecurringSeries(seriesId: string): Promise<ResponseResult<{ ended: true }, string> | FullErrorResult> {
	return endRecurringSeriesChain({ seriesId })
}
