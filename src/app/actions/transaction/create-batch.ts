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
import { createTransactionsBatchSchema, type CreateTransactionsBatchInput } from '@lib/schemas/transaction/create-transactions-batch'
import { isIncomeCategory } from '@lib/utils/category.utils'
import { toMonthStart } from '@lib/utils/monthly-budget.utils'
import { to } from '@lib/utils/to.utils'
import { serializeTransaction } from '@transactions/transforms/transaction'

export type CreateTransactionsBatchResult = ResponseResult<TransactionSummary[], $ZodIssue[] | string>

const createTransactionsBatchChain = createAction<{ monthlyBudgetId: string; input: CreateTransactionsBatchInput }>()
	.use(withErrorBoundary(transactionLogger, '[createTransactionsBatch]: {error}'))
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
	.handler(async ({ monthlyBudgetId, input, resource: monthlyBudget, membership }): Promise<CreateTransactionsBatchResult> => {
		const t = await getTranslations('common.forms.transactions.create')
		if (monthlyBudget.status !== BUDGET_STATUS.ACTIVE) return BAD_REQUEST(t('monthly-budget.error.not-active'))

		const validation = await createTransactionsBatchSchema(t).safeParseAsync(input)
		if (!validation.success) return BAD_REQUEST(validation.error.issues)

		const { rows } = validation.data

		const uniqueCategoryIds = [...new Set(rows.map((row) => row.categoryId).filter((id): id is string => !!id))]
		const uniqueSourceAccountIds = [...new Set(rows.map((row) => row.sourceAccountId).filter((id): id is string => !!id))]

		const [categories, sourceAccounts] = await Promise.all([
			uniqueCategoryIds.length > 0
				? prisma.category.findMany({
						where: { id: { in: uniqueCategoryIds }, OR: [{ householdId: monthlyBudget.householdId }, { isBase: true }] },
					})
				: Promise.resolve([]),
			uniqueSourceAccountIds.length > 0
				? prisma.bankAccount.findMany({
						where: {
							id: { in: uniqueSourceAccountIds },
							householdId: monthlyBudget.householdId,
							OR: [{ householdMemberId: membership.id }, { sharedWith: { some: { householdMemberId: membership.id } } }],
						},
					})
				: Promise.resolve([]),
		])

		const categoryById = new Map(categories.map((category) => [category.id, category]))
		const sourceAccountById = new Map(sourceAccounts.map((account) => [account.id, account]))

		const issues: $ZodIssue[] = []
		rows.forEach((row, index) => {
			const category = row.categoryId ? categoryById.get(row.categoryId) : null
			if (row.categoryId && !category) {
				issues.push({ code: 'custom', path: ['rows', index, 'categoryId'], message: t('category.error.invalid') })
				return
			}

			const categoryIsIncome = category ? isIncomeCategory(category) : false
			if (row.type === PAYMENT_TYPE.INCOME && !categoryIsIncome) {
				issues.push({ code: 'custom', path: ['rows', index, 'categoryId'], message: t('category.error.invalid') })
			}
			if (row.type === PAYMENT_TYPE.EXPENSE && categoryIsIncome) {
				issues.push({ code: 'custom', path: ['rows', index, 'categoryId'], message: t('category.error.invalid') })
			}

			if (row.sourceAccountId && !sourceAccountById.get(row.sourceAccountId)) {
				issues.push({ code: 'custom', path: ['rows', index, 'sourceAccountId'], message: t('account.error.invalid') })
			}
		})

		if (issues.length > 0) return BAD_REQUEST(issues)

		const [createError, created] = await to(
			prisma.$transaction(async (tx) => {
				const existingBudgets = await tx.monthlyBudget.findMany({
					where: { householdId: monthlyBudget.householdId, householdMemberId: membership.id, type: BUDGET_TYPE.PERSONAL },
					orderBy: { month: 'asc' },
					select: { id: true, month: true },
				})

				const results = []
				for (const row of rows) {
					const createdRow = await tx.transaction.create({
						data: {
							...row,
							householdId: monthlyBudget.householdId,
							householdMemberId: membership.id,
							monthlyBudgetId,
							categoryId: row.categoryId ?? null,
							sourceAccountId: row.sourceAccountId ?? null,
							note: row.note || null,
						},
						include: { category: true, sourceAccount: true },
					})

					if (row.isRecurring && row.recurrenceRule) {
						const stampedRule = {
							...row.recurrenceRule,
							endDate: row.recurrenceRule.endDate?.toISOString(),
							seriesId: createdRow.id,
							occurrenceCount: 1,
						}
						results.push(
							await tx.transaction.update({
								where: { id: createdRow.id },
								data: { recurrenceRule: stampedRule },
								include: { category: true, sourceAccount: true },
							}),
						)

						const futureBudgets = existingBudgets.filter((budget) => budget.month > toMonthStart(row.date))
						if (futureBudgets.length > 0) {
							await materializeRecurringSeriesForward(tx, {
								householdId: monthlyBudget.householdId,
								householdMemberId: membership.id,
								anchor: {
									...row,
									categoryId: row.categoryId ?? null,
									sourceAccountId: row.sourceAccountId ?? null,
									note: row.note || null,
									recurrenceRule: stampedRule,
								},
								targetBudgets: futureBudgets,
							})
						}
					} else {
						results.push(createdRow)
					}
				}
				return results
			}),
		)

		if (createError) return INTERNAL_ERROR(createError)

		return CREATED(created.map(serializeTransaction))
	})

/**
 * Creates several personal transactions inside the given (active, own) monthly budget as one
 * atomic batch — Draft mode's "Save all". No row is committed unless every row is valid.
 */
export async function createTransactionsBatch(
	monthlyBudgetId: string,
	input: CreateTransactionsBatchInput,
): Promise<CreateTransactionsBatchResult | FullErrorResult> {
	return createTransactionsBatchChain({ monthlyBudgetId, input })
}
