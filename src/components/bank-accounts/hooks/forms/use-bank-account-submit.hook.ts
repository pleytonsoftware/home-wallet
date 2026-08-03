'use client'

import type { CreateBankAccountInput } from '@lib/schemas/bank-account/create-bank-account'
import type { UseFormReturn } from 'react-hook-form'
import type { $ZodIssue } from 'zod/v4/core'

import { useRouter } from '@/i18n/navigation'

import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { BANK_ACCOUNTS_QUERY_KEYS } from '@bank-accounts/constants/query-keys'
import { createBankAccountMutationOptions } from '@bank-accounts/hooks/mutations/create-bank-account.hook'
import { updateBankAccountMutationOptions } from '@bank-accounts/hooks/mutations/update-bank-account.hook'
import { logger } from '@lib/logger'
import { applyServerErrors } from '@lib/utils/form'
import { useMutation, useQueryClient } from '@tanstack/react-query'

type BankAccountFormValues = CreateBankAccountInput
type BankAccountActionResult = { success: false; error: $ZodIssue[] | string } | { success: true; data: unknown }

interface UseBankAccountSubmitParams {
	mode: 'create' | 'edit'
	householdId: string
	bankAccountId?: string
	form: UseFormReturn<BankAccountFormValues>
	onSuccess?: () => void
}

/**
 * Drives both the create and edit bank-account forms from one hook: two `useMutation`s are
 * always created (rules of hooks forbid calling one conditionally), only the one matching
 * `mode` is ever triggered or returned.
 */
export const useBankAccountSubmit = ({ mode, householdId, bankAccountId, form, onSuccess }: UseBankAccountSubmitParams) => {
	const router = useRouter()
	const queryClient = useQueryClient()
	const t = useTranslations('bank-accounts-page.form')

	const handleSuccess = async (res: BankAccountActionResult) => {
		if (!res.success) {
			applyServerErrors(form, res.error, t('error'))
			throw new Error(t('error'))
		}
		await queryClient.invalidateQueries({ queryKey: BANK_ACCOUNTS_QUERY_KEYS.bankAccounts(householdId) })
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

	const createMutation = useMutation(createBankAccountMutationOptions(householdId, { onSuccess: handleSuccess, onError: handleError }))
	const updateMutation = useMutation(updateBankAccountMutationOptions(bankAccountId ?? '', { onSuccess: handleSuccess, onError: handleError }))

	return mode === 'create' ? createMutation : updateMutation
}
