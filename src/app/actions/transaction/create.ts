'use server'

import type { FullErrorResult, ResponseResult } from '@lib/errors/types'
import type { TransactionSummary } from '@transactions/types'
import type { $ZodIssue } from 'zod/v4/core'

import { getTranslations } from 'next-intl/server'

import { materializeRecurringSeriesForward } from '@actions/transaction/recurrence-materialization'
import { createAction } from '@lib/actions/action-builder'
import { withActiveMembership, withAuthorizedSession, withErrorBoundary, withOwnedResource } from '@lib/actions/middlewares'
import { BUDGET_STATUS, BUDGET_TYPE } from '@lib/constants/budget.enum'
import { PAYMENT_TYPE } from '@lib/constants/payment.enum'
import { BAD_REQUEST, CREATED, INTERNAL_ERROR } from '@lib/errors'
import { transactionLogger } from '@lib/logger'
import { prisma } from '@lib/prisma'
import { createTransactionSchema, type CreateTransactionInput } from '@lib/schemas/transaction/create-transaction'
import { isIncomeCategory } from '@lib/utils/category.utils'
import { toMonthStart } from '@lib/utils/monthly-budget.utils'
import { to } from '@lib/utils/to.utils'
import { serializeTransaction } from '@transactions/transforms/transaction'

export type CreateTransactionResult = ResponseResult<TransactionSummary, $ZodIssue[] | string>

const createTransactionChain = createAction<{ monthlyBudgetId: string; input: CreateTransactionInput }>()
	.use(withErrorBoundary(transactionLogger, '[createTransaction]: {error}'))
	.use(withAuthorizedSession)
	.use(
		withOwnedResource(({ monthlyBudgetId }) =>
			prisma.monthlyBudget.findUnique({
				where: { id: monthlyBudgetId },
				select: { householdId: true, householdMemberId: true, status: true },
			}),
		),
	)
	.use(withActiveMembership((ctx) => ctx.resource.householdId, { requireOwner: (ctx) => ctx.resource.householdMemberId }))
	.handler(async ({ monthlyBudgetId, input, resource: monthlyBudget, membership }): Promise<CreateTransactionResult> => {
		const t = await getTranslations('common.forms.transactions.create')
		if (monthlyBudget.status !== BUDGET_STATUS.ACTIVE) return BAD_REQUEST(t('monthly-budget.error.not-active'))

		const validation = await createTransactionSchema(t).safeParseAsync(input)
		if (!validation.success) return BAD_REQUEST(validation.error.issues)

		const { name, amount, type, categoryId, sourceAccountId, note, date, isRecurring, recurrenceRule } = validation.data

		const category = categoryId
			? await prisma.category.findFirst({
					where: { id: categoryId, OR: [{ householdId: monthlyBudget.householdId }, { isBase: true }] },
				})
			: null
		if (categoryId && !category) return BAD_REQUEST(t('category.error.invalid'))

		const categoryIsIncome = category ? isIncomeCategory(category) : false
		if (type === PAYMENT_TYPE.INCOME && !categoryIsIncome) return BAD_REQUEST(t('category.error.invalid'))
		if (type === PAYMENT_TYPE.EXPENSE && categoryIsIncome) return BAD_REQUEST(t('category.error.invalid'))

		if (sourceAccountId) {
			const account = await prisma.bankAccount.findFirst({
				where: {
					id: sourceAccountId,
					householdId: monthlyBudget.householdId,
					OR: [{ householdMemberId: membership.id }, { sharedWith: { some: { householdMemberId: membership.id } } }],
				},
			})
			if (!account) return BAD_REQUEST(t('account.error.invalid'))
		}

		const [createError, result] = await to(
			prisma.$transaction(async (tx) => {
				const transaction = await tx.transaction.create({
					data: {
						householdId: monthlyBudget.householdId,
						householdMemberId: membership.id,
						monthlyBudgetId,
						name,
						amount,
						type,
						categoryId: categoryId ?? null,
						sourceAccountId: sourceAccountId ?? null,
						note: note || null,
						date,
						isRecurring,
						recurrenceRule: recurrenceRule ?? undefined,
					},
					include: { category: true, sourceAccount: true },
				})

				if (!isRecurring || !recurrenceRule) return transaction

				const stampedRule = {
					...recurrenceRule,
					endDate: recurrenceRule.endDate?.toISOString(),
					seriesId: transaction.id,
					occurrenceCount: 1,
				}
				const stamped = await tx.transaction.update({
					where: { id: transaction.id },
					data: { recurrenceRule: stampedRule },
					include: { category: true, sourceAccount: true },
				})

				const futureBudgets = await tx.monthlyBudget.findMany({
					where: {
						householdId: monthlyBudget.householdId,
						householdMemberId: membership.id,
						type: BUDGET_TYPE.PERSONAL,
						month: { gt: toMonthStart(date) },
					},
					orderBy: { month: 'asc' },
					select: { id: true, month: true },
				})

				if (futureBudgets.length > 0) {
					await materializeRecurringSeriesForward(tx, {
						householdId: monthlyBudget.householdId,
						householdMemberId: membership.id,
						anchor: {
							name,
							amount,
							type,
							categoryId: categoryId ?? null,
							sourceAccountId: sourceAccountId ?? null,
							note: note || null,
							date,
							recurrenceRule: stampedRule,
						},
						targetBudgets: futureBudgets,
					})
				}

				return stamped
			}),
		)

		if (createError) return INTERNAL_ERROR(createError)

		return CREATED(serializeTransaction(result))
	})

/** Creates a personal transaction inside the given (active, own) monthly budget. */
export async function createTransaction(monthlyBudgetId: string, input: CreateTransactionInput): Promise<CreateTransactionResult | FullErrorResult> {
	return createTransactionChain({ monthlyBudgetId, input })
}
