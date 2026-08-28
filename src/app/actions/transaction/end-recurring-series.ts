'use server'

import type { FullErrorResult, ResponseResult } from '@lib/errors/types'

import { getActiveMembership } from '@actions/household/active-memberships'
import { cancelRecurringSeries } from '@actions/transaction/recurrence-materialization'
import { authorizedSession } from '@lib/auth/utils'
import { FORBIDDEN, INTERNAL_ERROR, OK } from '@lib/errors'
import { transactionLogger } from '@lib/logger'
import { prisma } from '@lib/prisma'
import { to } from '@lib/utils/to.utils'

/** Stops a recurring series from ever being carried forward again, without deleting any existing occurrence. */
export async function endRecurringSeries(seriesId: string): Promise<ResponseResult<{ ended: true }, string> | FullErrorResult> {
	try {
		const { session, error } = await authorizedSession()
		if (error) return error

		const seriesTransaction = await prisma.transaction.findFirst({
			where: { recurrenceRule: { path: ['seriesId'], equals: seriesId } },
			select: { householdId: true, householdMemberId: true },
		})
		if (!seriesTransaction) return FORBIDDEN()

		const membership = await getActiveMembership({ userId: session.user.id, householdId: seriesTransaction.householdId })
		if (!membership || membership.id !== seriesTransaction.householdMemberId) return FORBIDDEN()

		const [cancelError] = await to(cancelRecurringSeries(prisma, { householdMemberId: membership.id, seriesId }))
		if (cancelError) return INTERNAL_ERROR(cancelError)

		return OK({ ended: true })
	} catch (error) {
		transactionLogger.error('[endRecurringSeries]: {error}', { error })
		return INTERNAL_ERROR(error)
	}
}
