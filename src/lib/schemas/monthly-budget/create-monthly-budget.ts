import type { NestedKey, useTranslations } from 'next-intl'

import { z } from 'zod'

export const MIN_MONTHLY_BUDGET_TARGET_AMOUNT = 0.01
const MONTH_PARAM_REGEX = /^\d{4}-(0[1-9]|1[0-2])$/
const __namespace = 'common.forms.monthly-budgets.create' satisfies NestedKey

export const createMonthlyBudgetSchema = (t: ReturnType<typeof useTranslations<typeof __namespace>>) =>
	z.object({
		month: z.string().regex(MONTH_PARAM_REGEX, t('month.error.invalid')),
		targetAmount: z.number(t('target-amount.error.invalid')).min(MIN_MONTHLY_BUDGET_TARGET_AMOUNT, t('target-amount.error.positive')).optional(),
	})

export type CreateMonthlyBudgetInput = z.infer<ReturnType<typeof createMonthlyBudgetSchema>>
