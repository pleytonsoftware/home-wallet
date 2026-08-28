'use server'

import type { FullErrorResult, ResponseResult } from '@lib/errors/types'
import type { RecurrenceRule, TransactionSummary } from '@transactions/types'
import type { $ZodIssue } from 'zod/v4/core'

import { getTranslations } from 'next-intl/server'

import { getActiveMembership } from '@actions/household/active-memberships'
import { materializeRecurringSeriesForward } from '@actions/transaction/recurrence-materialization'
import { authorizedSession } from '@lib/auth/utils'
import { BUDGET_TYPE } from '@lib/constants/budget.enum'
import { PAYMENT_TYPE } from '@lib/constants/payment.enum'
import { BAD_REQUEST, FORBIDDEN, INTERNAL_ERROR, OK } from '@lib/errors'
import { transactionLogger } from '@lib/logger'
import { prisma } from '@lib/prisma'
import { updateTransactionSchema, type UpdateTransactionInput } from '@lib/schemas/transaction/update-transaction'
import { isIncomeCategory } from '@lib/utils/category.utils'
import { toMonthStart } from '@lib/utils/monthly-budget.utils'
import { to } from '@lib/utils/to.utils'
import { serializeTransaction } from '@transactions/transforms/transaction'

export type UpdateTransactionResult = ResponseResult<TransactionSummary, $ZodIssue[] | string>

/** Updates a personal transaction. Restricted to its creator/owner. */
export async function updateTransaction(transactionId: string, input: UpdateTransactionInput): Promise<UpdateTransactionResult | FullErrorResult> {
	try {
		const { session, error } = await authorizedSession()
		if (error) return error

		const transaction = await prisma.transaction.findUnique({
			where: { id: transactionId },
			select: { householdId: true, householdMemberId: true, recurrenceRule: true },
		})
		if (!transaction) return FORBIDDEN()

		const membership = await getActiveMembership({ userId: session.user.id, householdId: transaction.householdId })
		if (!membership || membership.id !== transaction.householdMemberId) return FORBIDDEN()

		const t = await getTranslations('common.forms.transactions.create')
		const validation = await updateTransactionSchema(t).safeParseAsync(input)
		if (!validation.success) return BAD_REQUEST(validation.error.issues)

		const { name, amount, type, categoryId, sourceAccountId, note, date, isRecurring, recurrenceRule } = validation.data

		const category = categoryId
			? await prisma.category.findFirst({
					where: { id: categoryId, OR: [{ householdId: transaction.householdId }, { isBase: true }] },
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
					householdId: transaction.householdId,
					OR: [{ householdMemberId: membership.id }, { sharedWith: { some: { householdMemberId: membership.id } } }],
				},
			})
			if (!account) return BAD_REQUEST(t('account.error.invalid'))
		}

		const existingRule = transaction.recurrenceRule as RecurrenceRule | null
		const isNewSeries = isRecurring && recurrenceRule && !existingRule?.seriesId
		const finalRecurrenceRule =
			isRecurring && recurrenceRule
				? {
						...recurrenceRule,
						endDate: recurrenceRule.endDate?.toISOString(),
						seriesId: existingRule?.seriesId ?? transactionId,
						occurrenceCount: existingRule?.occurrenceCount ?? 1,
					}
				: undefined

		const [updateError, updated] = await to(
			prisma.$transaction(async (tx) => {
				const result = await tx.transaction.update({
					where: { id: transactionId },
					data: {
						name,
						amount,
						type,
						categoryId: categoryId ?? null,
						sourceAccountId: sourceAccountId ?? null,
						note: note || null,
						date,
						isRecurring,
						recurrenceRule: finalRecurrenceRule,
					},
					include: { category: true, sourceAccount: true },
				})

				if (!isNewSeries || !finalRecurrenceRule) return result

				const futureBudgets = await tx.monthlyBudget.findMany({
					where: {
						householdId: transaction.householdId,
						householdMemberId: membership.id,
						type: BUDGET_TYPE.PERSONAL,
						month: { gt: toMonthStart(date) },
					},
					orderBy: { month: 'asc' },
					select: { id: true, month: true },
				})

				if (futureBudgets.length > 0) {
					await materializeRecurringSeriesForward(tx, {
						householdId: transaction.householdId,
						householdMemberId: membership.id,
						anchor: {
							name,
							amount,
							type,
							categoryId: categoryId ?? null,
							sourceAccountId: sourceAccountId ?? null,
							note: note || null,
							date,
							recurrenceRule: finalRecurrenceRule,
						},
						targetBudgets: futureBudgets,
					})
				}

				return result
			}),
		)

		if (updateError) return INTERNAL_ERROR(updateError)

		return OK(serializeTransaction(updated))
	} catch (error) {
		transactionLogger.error('[updateTransaction]: {error}', { error })
		return INTERNAL_ERROR(error)
	}
}
