import type { MonthlyBudgetDetailResponse } from '@monthly-budgets/types'

import { NextResponse } from 'next/server'

import { z } from 'zod'

import { withActiveMembership, withAuth, withErrorBoundary, withParamsValidation } from '@lib/api/middlewares'
import { createRoute } from '@lib/api/route-builder'
import { BUDGET_TYPE } from '@lib/constants/budget.enum'
import { PAYMENT_TYPE } from '@lib/constants/payment.enum'
import { monthlyBudgetLogger } from '@lib/logger'
import { prisma } from '@lib/prisma'
import { computeNextAvailableMonth, formatMonthParam, parseMonthParam } from '@lib/utils/monthly-budget.utils'
import { MONTHLY_BUDGETS_API_PATHS } from '@monthly-budgets/constants/api'
import { computeMonthlyBudgetTotals, serializeMonthlyBudget } from '@monthly-budgets/transforms/monthly-budget'

const paramsSchema = z.object({
	id: z.string().min(1),
	month: z
		.string()
		.transform((value) => parseMonthParam(value))
		.refine((month): month is Date => month !== null, { message: 'Invalid month' }),
})

export const GET = createRoute<{ params: Promise<{ id: string; month: string }> }>()
	.use(withErrorBoundary(monthlyBudgetLogger, `[GET ${MONTHLY_BUDGETS_API_PATHS.GET_MONTHLY_BUDGET(':id', ':month')}]: {error}`))
	.use(withAuth)
	.use(withParamsValidation(paramsSchema))
	.use(withActiveMembership)
	.handler(async (_request, { params: { id: householdId, month }, membership }) => {
		const [budget, latestBudget] = await Promise.all([
			prisma.monthlyBudget.findFirst({
				where: { householdId, householdMemberId: membership.id, type: BUDGET_TYPE.PERSONAL, month },
			}),
			prisma.monthlyBudget.findFirst({
				where: { householdId, householdMemberId: membership.id, type: BUDGET_TYPE.PERSONAL },
				orderBy: { month: 'desc' },
				select: { month: true },
			}),
		])

		const nextAvailableMonth = formatMonthParam(computeNextAvailableMonth(latestBudget?.month ?? null))

		if (!budget) {
			const data: MonthlyBudgetDetailResponse = { budget: null, nextAvailableMonth }
			return NextResponse.json(data)
		}

		const totals = await prisma.transaction.groupBy({
			by: ['type'],
			where: { monthlyBudgetId: budget.id },
			_sum: { amount: true },
		})

		const income = totals.find((t) => t.type === PAYMENT_TYPE.INCOME)?._sum.amount ?? 0
		const expenses = totals.find((t) => t.type === PAYMENT_TYPE.EXPENSE)?._sum.amount ?? 0

		const data: MonthlyBudgetDetailResponse = {
			budget: serializeMonthlyBudget(budget, computeMonthlyBudgetTotals(income, expenses)),
			nextAvailableMonth,
		}

		return NextResponse.json(data)
	})

export const dynamic = 'force-dynamic'
