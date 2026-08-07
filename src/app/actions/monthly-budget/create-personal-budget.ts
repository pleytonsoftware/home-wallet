'use server'

import type { FullErrorResult, ResponseResult } from '@lib/errors/types'
import type { Prisma } from '@lib/prisma'
import type { $ZodIssue } from 'zod/v4/core'

import { getTranslations } from 'next-intl/server'

import { getActiveMembership } from '@actions/household/active-memberships'
import { authorizedSession } from '@lib/auth/utils'
import { BUDGET_STATUS, BUDGET_TYPE } from '@lib/constants/budget.enum'
import { BAD_REQUEST, CREATED, FORBIDDEN, INTERNAL_ERROR } from '@lib/errors'
import { monthlyBudgetLogger } from '@lib/logger'
import { prisma } from '@lib/prisma'
import { createMonthlyBudgetSchema, type CreateMonthlyBudgetInput } from '@lib/schemas/monthly-budget/create-monthly-budget'
import { computeNextAvailableMonth, formatMonthParam, parseMonthParam } from '@lib/utils/monthly-budget.utils'
import { to } from '@lib/utils/to.utils'

type MonthlyBudgetResult = Prisma.MonthlyBudgetGetPayload<object>
export type CreatePersonalBudgetResult = ResponseResult<MonthlyBudgetResult, $ZodIssue[] | string>

/**
 * Creates a personal monthly budget for the requester. Budgets must be created strictly in
 * sequence — only the month immediately after the member's latest created budget (or the
 * current calendar month, if they have none yet) may be created.
 */
export async function createPersonalMonthlyBudget(
	householdId: string,
	input: CreateMonthlyBudgetInput,
): Promise<CreatePersonalBudgetResult | FullErrorResult> {
	try {
		const { session, error } = await authorizedSession()
		if (error) return error

		const membership = await getActiveMembership({ userId: session.user.id, householdId })
		if (!membership) return FORBIDDEN()

		const t = await getTranslations('common.forms.monthly-budgets.create')
		const validation = await createMonthlyBudgetSchema(t).safeParseAsync(input)
		if (!validation.success) return BAD_REQUEST(validation.error.issues)

		const month = parseMonthParam(validation.data.month)
		if (!month) return BAD_REQUEST(t('month.error.invalid'))

		const latestBudget = await prisma.monthlyBudget.findFirst({
			where: { householdId, householdMemberId: membership.id, type: BUDGET_TYPE.PERSONAL },
			orderBy: { month: 'desc' },
			select: { month: true },
		})

		const nextAvailableMonth = computeNextAvailableMonth(latestBudget?.month ?? null)
		if (month.getTime() !== nextAvailableMonth.getTime()) {
			return BAD_REQUEST(t('month.error.out-of-sequence', { month: formatMonthParam(nextAvailableMonth) }))
		}

		const [createError, monthlyBudget] = await to(
			prisma.monthlyBudget.create({
				data: {
					householdId,
					householdMemberId: membership.id,
					month,
					type: BUDGET_TYPE.PERSONAL,
					status: BUDGET_STATUS.ACTIVE,
					targetAmount: validation.data.targetAmount,
				},
			}),
		)

		if (createError) return INTERNAL_ERROR(createError)

		return CREATED(monthlyBudget)
	} catch (error) {
		monthlyBudgetLogger.error('[createPersonalMonthlyBudget]: {error}', { error })
		return INTERNAL_ERROR(error)
	}
}
