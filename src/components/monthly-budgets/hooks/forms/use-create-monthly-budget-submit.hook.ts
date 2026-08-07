'use client'

import type { CreateMonthlyBudgetInput } from '@lib/schemas/monthly-budget/create-monthly-budget'
import type { UseFormReturn } from 'react-hook-form'
import type { $ZodIssue } from 'zod/v4/core'

import { useRouter } from '@/i18n/navigation'

import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { logger } from '@lib/logger'
import { applyServerErrors } from '@lib/utils/form'
import { MONTHLY_BUDGETS_QUERY_KEYS } from '@monthly-budgets/constants/query-keys'
import { createMonthlyBudgetMutationOptions } from '@monthly-budgets/hooks/mutations/create-monthly-budget.hook'
import { useMutation, useQueryClient } from '@tanstack/react-query'

type MonthlyBudgetActionResult = { success: false; error: $ZodIssue[] | string } | { success: true; data: unknown }

interface UseCreateMonthlyBudgetSubmitParams {
	householdId: string
	form: UseFormReturn<CreateMonthlyBudgetInput>
	onSuccess?: () => void
}

export const useCreateMonthlyBudgetSubmit = ({ householdId, form, onSuccess }: UseCreateMonthlyBudgetSubmitParams) => {
	const router = useRouter()
	const queryClient = useQueryClient()
	const t = useTranslations('monthly-budget-page.form')

	const handleSuccess = async (res: MonthlyBudgetActionResult) => {
		if (!res.success) {
			applyServerErrors(form, res.error, t('error'))
			throw new Error(t('error'))
		}
		await queryClient.invalidateQueries({ queryKey: MONTHLY_BUDGETS_QUERY_KEYS.all(householdId) })
		toast.success(t('created'))
		router.refresh()
		onSuccess?.()
	}

	const handleError = (err: unknown) => {
		logger.error('An error has ocurred: {err}', { err })
		if (!form.formState.errors.root) {
			form.setError('root', { type: 'manual', message: err instanceof Error ? err.message : t('error') })
		}
		toast.error(err instanceof Error ? err.message : t('error'))
	}

	return useMutation(createMonthlyBudgetMutationOptions(householdId, { onSuccess: handleSuccess, onError: handleError }))
}
