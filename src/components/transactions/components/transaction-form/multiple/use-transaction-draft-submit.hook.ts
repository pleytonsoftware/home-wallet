'use client'

import type { CreateTransactionsBatchInput } from '@lib/schemas/transaction/create-transactions-batch'
import type { UseFormReturn } from 'react-hook-form'

import { useRouter } from '@/i18n/navigation'

import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { logger } from '@lib/logger'
import { applyServerRowErrors } from '@lib/utils/form'
import { MONTHLY_BUDGETS_QUERY_KEYS } from '@monthly-budgets/constants/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { TRANSACTIONS_QUERY_KEYS } from '@transactions/constants/query-keys'
import { createTransactionsBatchMutationOptions } from '@transactions/hooks/mutations/create-transactions-batch.hook'

import { makeEmptyDraftRow } from './transaction-draft.utils'

interface UseTransactionDraftSubmitParams {
	householdId: string
	monthlyBudgetId: string
	form: UseFormReturn<CreateTransactionsBatchInput>
	defaultDate: Date
	clearDraft: () => void
	onSuccess?: () => void
}

/** Draft mode's "Save all" — a create-only batch submit (Draft mode never edits an existing transaction). */
export const useTransactionDraftSubmit = ({
	householdId,
	monthlyBudgetId,
	form,
	defaultDate,
	clearDraft,
	onSuccess,
}: UseTransactionDraftSubmitParams) => {
	const router = useRouter()
	const queryClient = useQueryClient()
	const t = useTranslations('transactions-personal-page.form')
	const tMultiple = useTranslations('transactions-personal-page.form.multiple')

	return useMutation(
		createTransactionsBatchMutationOptions(monthlyBudgetId, {
			onSuccess: async (res) => {
				if (!res.success) {
					applyServerRowErrors(form, res.error, t('error'))
					throw new Error(t('error'))
				}
				await Promise.all([
					queryClient.invalidateQueries({ queryKey: MONTHLY_BUDGETS_QUERY_KEYS.all(householdId) }),
					queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEYS.transactions(householdId, monthlyBudgetId) }),
				])
				toast.success(tMultiple('save-success', { count: res.data.length }))
				clearDraft()
				form.reset({ rows: [makeEmptyDraftRow(defaultDate)] })
				router.refresh()
				onSuccess?.()
			},
			onError: (err) => {
				logger.error('An error has ocurred: {err}', { err })
				if (!form.formState.errors.root) {
					form.setError('root', { type: 'manual', message: err instanceof Error ? err.message : t('error') })
				}
				toast.error(err instanceof Error ? err.message : t('error'))
			},
		}),
	)
}
