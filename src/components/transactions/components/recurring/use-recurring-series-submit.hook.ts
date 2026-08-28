'use client'

import type { UpdateRecurringSeriesInput } from '@lib/schemas/transaction/update-recurring-series'
import type { UseFormReturn } from 'react-hook-form'

import { useRouter } from '@/i18n/navigation'

import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { updateTransaction } from '@actions/transaction/update'
import { logger } from '@lib/logger'
import { applyServerErrors } from '@lib/utils/form'
import { MONTHLY_BUDGETS_QUERY_KEYS } from '@monthly-budgets/constants/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { TRANSACTIONS_QUERY_KEYS } from '@transactions/constants/query-keys'

interface UseRecurringSeriesSubmitParams {
	householdId: string
	anchorTransactionId: string
	/** The series anchor's own occurrence date — carried through unchanged, not user-editable here. */
	anchorDate: Date
	form: UseFormReturn<UpdateRecurringSeriesInput>
	onSuccess?: () => void
}

/** Edits a recurring series' template by updating its anchor (most-recent) transaction — future materialization always reads the anchor's current fields, so this is exactly "edit the template going forward." */
export const useRecurringSeriesSubmit = ({ householdId, anchorTransactionId, anchorDate, form, onSuccess }: UseRecurringSeriesSubmitParams) => {
	const router = useRouter()
	const queryClient = useQueryClient()
	const t = useTranslations('transactions-recurring-page.form')

	return useMutation({
		mutationFn: async (input: UpdateRecurringSeriesInput) =>
			updateTransaction(anchorTransactionId, { ...input, date: anchorDate, isRecurring: true }),
		onSuccess: async (res) => {
			if (!res.success) {
				applyServerErrors(form, res.error, t('error'))
				throw new Error(t('error'))
			}
			await Promise.all([
				queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEYS.recurringSeries(householdId) }),
				queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEYS.transactions(householdId, res.data.monthlyBudgetId) }),
				queryClient.invalidateQueries({ queryKey: MONTHLY_BUDGETS_QUERY_KEYS.all(householdId) }),
			])
			toast.success(t('saved'))
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
	})
}
