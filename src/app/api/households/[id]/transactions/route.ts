import type { TransactionSummary } from '@transactions/types'

import { NextResponse } from 'next/server'

import { z } from 'zod'

import { withActiveMembership, withAuth, withErrorBoundary, withParamsValidation, withQueryValidation } from '@lib/api/middlewares'
import { createRoute } from '@lib/api/route-builder'
import { transactionLogger } from '@lib/logger'
import { prisma } from '@lib/prisma'
import { serializeTransaction } from '@transactions/transforms/transaction'

const paramsSchema = z.object({ id: z.string().min(1) })
const querySchema = z.object({ monthlyBudgetId: z.string().min(1) })

export const GET = createRoute<{ params: Promise<{ id: string }> }>()
	.use(withErrorBoundary(transactionLogger, '[GET /households/:id/transactions]: {error}'))
	.use(withAuth)
	.use(withParamsValidation(paramsSchema))
	.use(withQueryValidation(querySchema))
	.use(withActiveMembership)
	.handler(async (_request, { params: { id: householdId }, membership, query }) => {
		const transactions = await prisma.transaction.findMany({
			where: { householdId, householdMemberId: membership.id, monthlyBudgetId: query.monthlyBudgetId },
			include: { category: true, sourceAccount: true },
			orderBy: { date: 'desc' },
		})

		const data: Array<TransactionSummary> = transactions.map(serializeTransaction)

		return NextResponse.json(data)
	})

export const dynamic = 'force-dynamic'
