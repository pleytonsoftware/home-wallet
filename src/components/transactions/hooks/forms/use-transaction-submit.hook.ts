'use client'

import type { CreateTransactionInput } from '@lib/schemas/transaction/create-transaction'
import type { UseFormReturn } from 'react-hook-form'
import type { $ZodIssue } from 'zod/v4/core'

import { useRouter } from '@/i18n/navigation'

import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { logger } from '@lib/logger'
import { applyServerErrors } from '@lib/utils/form'
import { MONTHLY_BUDGETS_QUERY_KEYS } from '@monthly-budgets/constants/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { TRANSACTIONS_QUERY_KEYS } from '@transactions/constants/query-keys'
import { createTransactionMutationOptions } from '@transactions/hooks/mutations/create-transaction.hook'
import { updateTransactionMutationOptions } from '@transactions/hooks/mutations/update-transaction.hook'

type TransactionFormValues = CreateTransactionInput
type TransactionActionResult = { success: false; error: $ZodIssue[] | string } | { success: true; data: unknown }

interface UseTransactionSubmitParams {
	mode: 'create' | 'edit'
	householdId: string
	monthlyBudgetId: string
	transactionId?: string
	form: UseFormReturn<TransactionFormValues>
	onSuccess?: () => void
}

/**
 * Drives both the create and edit transaction forms from one hook: two `useMutation`s are always
 * created (rules of hooks forbid calling one conditionally), only the one matching `mode` is ever
 * triggered or returned.
 */
export const useTransactionSubmit = ({ mode, householdId, monthlyBudgetId, transactionId, form, onSuccess }: UseTransactionSubmitParams) => {
	const router = useRouter()
	const queryClient = useQueryClient()
	const t = useTranslations('transactions-personal-page.form')

	const handleSuccess = async (res: TransactionActionResult) => {
		if (!res.success) {
			applyServerErrors(form, res.error, t('error'))
			throw new Error(t('error'))
		}
		await Promise.all([
			queryClient.invalidateQueries({ queryKey: MONTHLY_BUDGETS_QUERY_KEYS.all(householdId) }),
			queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEYS.transactions(householdId, monthlyBudgetId) }),
		])
		toast.success(mode === 'create' ? t('created') : t('saved'))
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

	const createMutation = useMutation(createTransactionMutationOptions(monthlyBudgetId, { onSuccess: handleSuccess, onError: handleError }))
	const updateMutation = useMutation(updateTransactionMutationOptions(transactionId ?? '', { onSuccess: handleSuccess, onError: handleError }))

	return mode === 'create' ? createMutation : updateMutation
}
