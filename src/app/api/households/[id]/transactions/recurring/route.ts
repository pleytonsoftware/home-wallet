import type { RecurrenceRule, RecurringSeriesSummary } from '@transactions/types'

import { NextResponse } from 'next/server'

import { z } from 'zod'

import { groupBySeriesAnchor } from '@actions/transaction/recurrence-materialization'
import { Prisma } from '@hw-prisma/client'
import { withActiveMembership, withAuth, withErrorBoundary, withParamsValidation } from '@lib/api/middlewares'
import { createRoute } from '@lib/api/route-builder'
import { transactionLogger } from '@lib/logger'
import { prisma } from '@lib/prisma'
import { computeNextOccurrence, isSeriesEnded } from '@lib/utils/recurrence.utils'
import { serializeRecurringSeries } from '@transactions/transforms/transaction'

const paramsSchema = z.object({ id: z.string().min(1) })

export const GET = createRoute<{ params: Promise<{ id: string }> }>()
	.use(withErrorBoundary(transactionLogger, '[GET /households/:id/transactions/recurring]: {error}'))
	.use(withAuth)
	.use(withParamsValidation(paramsSchema))
	.use(withActiveMembership)
	.handler(async (_request, { params: { id: householdId }, membership }) => {
		const transactions = await prisma.transaction.findMany({
			where: { householdId, householdMemberId: membership.id, recurrenceRule: { not: Prisma.DbNull } },
			include: { category: true, sourceAccount: true },
		})

		const data: Array<RecurringSeriesSummary> = [...groupBySeriesAnchor(transactions).entries()].map(([seriesId, anchor]) => {
			const rule = anchor.recurrenceRule as unknown as RecurrenceRule
			const ended = isSeriesEnded(anchor.date, rule)
			const status = anchor.isRecurring && !ended ? 'active' : 'ended'
			const nextOccurrence = status === 'active' ? computeNextOccurrence(anchor.date, rule, new Date(), rule.occurrenceCount ?? 1) : null

			return serializeRecurringSeries(anchor, {
				seriesId,
				status,
				nextOccurrenceDate: nextOccurrence ? nextOccurrence.toISOString() : null,
			})
		})

		return NextResponse.json(data)
	})

export const dynamic = 'force-dynamic'
