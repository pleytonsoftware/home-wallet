'use server'

import type { FullErrorResult, ResponseResult } from '@lib/errors/types'
import type { Prisma } from '@lib/prisma'
import type { RecurrenceRule } from '@transactions/types'
import type { $ZodIssue } from 'zod/v4/core'

import { getTranslations } from 'next-intl/server'

import { getActiveMembership } from '@actions/household/active-memberships'
import { groupBySeriesAnchor, materializeRecurringSeriesForward } from '@actions/transaction/recurrence-materialization'
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
			prisma.$transaction(async (tx) => {
				const budget = await tx.monthlyBudget.create({
					data: {
						householdId,
						householdMemberId: membership.id,
						month,
						type: BUDGET_TYPE.PERSONAL,
						status: BUDGET_STATUS.ACTIVE,
						targetAmount: validation.data.targetAmount,
					},
				})

				await materializeRecurringTransactions(tx, { householdId, householdMemberId: membership.id, monthlyBudgetId: budget.id, month })

				return budget
			}),
		)

		if (createError) return INTERNAL_ERROR(createError)

		return CREATED(monthlyBudget)
	} catch (error) {
		monthlyBudgetLogger.error('[createPersonalMonthlyBudget]: {error}', { error })
		return INTERNAL_ERROR(error)
	}
}

interface MaterializeRecurringTransactionsParams {
	householdId: string
	householdMemberId: string
	monthlyBudgetId: string
	month: Date
}

/**
 * Carries recurring transactions forward into a newly created monthly budget. Looks across
 * *all* of the member's recurring transactions (not just the previous budget) and keeps only the
 * latest materialized row per series as the anchor — a YEARLY or `interval > 1` series can
 * legitimately produce zero occurrences in some months, so scoping the lookup to only the
 * immediately-preceding budget would silently drop the series the next time it's actually due.
 */
async function materializeRecurringTransactions(
	tx: Prisma.TransactionClient,
	{ householdId, householdMemberId, monthlyBudgetId, month }: MaterializeRecurringTransactionsParams,
): Promise<void> {
	const recurringTransactions = await tx.transaction.findMany({
		where: { householdId, householdMemberId, isRecurring: true },
		select: {
			id: true,
			name: true,
			amount: true,
			type: true,
			categoryId: true,
			sourceAccountId: true,
			note: true,
			date: true,
			recurrenceRule: true,
		},
	})

	for (const anchor of groupBySeriesAnchor(recurringTransactions).values()) {
		await materializeRecurringSeriesForward(tx, {
			householdId,
			householdMemberId,
			anchor: {
				name: anchor.name,
				amount: anchor.amount,
				type: anchor.type,
				categoryId: anchor.categoryId,
				sourceAccountId: anchor.sourceAccountId,
				note: anchor.note,
				date: anchor.date,
				recurrenceRule: anchor.recurrenceRule as unknown as RecurrenceRule,
			},
			targetBudgets: [{ id: monthlyBudgetId, month }],
		})
	}
}
