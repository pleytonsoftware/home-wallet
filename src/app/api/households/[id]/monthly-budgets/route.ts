import type { MonthlyBudgetsListResponse } from '@monthly-budgets/types'

import { NextResponse } from 'next/server'

import { z } from 'zod'

import { withActiveMembership, withAuth, withErrorBoundary, withParamsValidation, withQueryValidation } from '@lib/api/middlewares'
import { createRoute } from '@lib/api/route-builder'
import { BUDGET_TYPE } from '@lib/constants/budget.enum'
import { PAYMENT_TYPE } from '@lib/constants/payment.enum'
import { monthlyBudgetLogger } from '@lib/logger'
import { prisma } from '@lib/prisma'
import { computeNextAvailableMonth, formatMonthParam } from '@lib/utils/monthly-budget.utils'
import { MONTHLY_BUDGETS_API_PATHS } from '@monthly-budgets/constants/api'
import { computeMonthlyBudgetTotals, serializeMonthlyBudget } from '@monthly-budgets/transforms/monthly-budget'

const paramsSchema = z.object({ id: z.string().min(1) })
const querySchema = z.object({ year: z.coerce.number().int().positive().optional() })

export const GET = createRoute<{ params: Promise<{ id: string }> }>()
	.use(withErrorBoundary(monthlyBudgetLogger, `[GET ${MONTHLY_BUDGETS_API_PATHS.GET_MONTHLY_BUDGETS(':id', 0)}]: {error}`))
	.use(withAuth)
	.use(withParamsValidation(paramsSchema))
	.use(withQueryValidation(querySchema))
	.use(withActiveMembership)
	.handler(async (_request, { params: { id: householdId }, membership, query }) => {
		const year = query.year ?? new Date().getUTCFullYear()

		const budgets = await prisma.monthlyBudget.findMany({
			where: {
				householdId,
				householdMemberId: membership.id,
				type: BUDGET_TYPE.PERSONAL,
				month: { gte: new Date(Date.UTC(year, 0, 1)), lt: new Date(Date.UTC(year + 1, 0, 1)) },
			},
			orderBy: { month: 'asc' },
		})

		const latestBudget = await prisma.monthlyBudget.findFirst({
			where: { householdId, householdMemberId: membership.id, type: BUDGET_TYPE.PERSONAL },
			orderBy: { month: 'desc' },
			select: { month: true },
		})

		const totalsByBudget = await prisma.transaction.groupBy({
			by: ['monthlyBudgetId', 'type'],
			where: { monthlyBudgetId: { in: budgets.map((budget) => budget.id) } },
			_sum: { amount: true },
		})

		// TODO: Check performance of this endpoint
		const data: MonthlyBudgetsListResponse = {
			budgets: budgets.map((budget) => {
				const income = totalsByBudget.find((t) => t.monthlyBudgetId === budget.id && t.type === PAYMENT_TYPE.INCOME)?._sum.amount ?? 0
				const expenses = totalsByBudget.find((t) => t.monthlyBudgetId === budget.id && t.type === PAYMENT_TYPE.EXPENSE)?._sum.amount ?? 0
				return serializeMonthlyBudget(budget, computeMonthlyBudgetTotals(income, expenses))
			}),
			nextAvailableMonth: formatMonthParam(computeNextAvailableMonth(latestBudget?.month ?? null)),
		}

		return NextResponse.json(data)
	})

export const dynamic = 'force-dynamic'
