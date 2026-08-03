'use client'

import type { BankAccountSummary } from '@bank-accounts/types'
import type { FC } from 'react'

import { TrashIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { Icon } from '@atoms/icon'
import { BANK_ACCOUNTS_QUERY_KEYS } from '@bank-accounts/constants/query-keys'
import { deleteBankAccountMutationOptions } from '@bank-accounts/hooks/mutations/delete-bank-account.hook'
import { logger } from '@lib/logger'
import { ConfirmSaveButton } from '@molecules/confirm-save-button'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface BankAccountDeleteButtonProps {
	bankAccount: BankAccountSummary
}

export const BankAccountDeleteButton: FC<BankAccountDeleteButtonProps> = ({ bankAccount }) => {
	const t = useTranslations('bank-accounts-page.delete')
	const queryClient = useQueryClient()

	const deleteMutation = useMutation(
		deleteBankAccountMutationOptions(bankAccount.id, {
			onSuccess: async (res) => {
				if (!res.success) {
					toast.error(t('error'))
					return
				}
				await queryClient.invalidateQueries({ queryKey: BANK_ACCOUNTS_QUERY_KEYS.bankAccounts(bankAccount.householdId) })
				toast.success(t('success'))
			},
			onError: (err) => {
				logger.error('An error has ocurred: {err}', { err })
				toast.error(t('error'))
			},
		}),
	)

	return (
		<ConfirmSaveButton
			variant='ghost'
			className='w-full justify-start gap-2 px-2 font-normal text-destructive hover:text-destructive'
			loading={deleteMutation.isPending}
			confirmVariant='destructive'
			dialogTitle={t('confirm-title')}
			dialogDescription={t('confirm-description', { name: bankAccount.name })}
			confirm={t('confirm-button')}
			onConfirmClick={() => deleteMutation.mutate()}
		>
			<Icon IconComponent={TrashIcon} size='sm' />
			{t('trigger')}
		</ConfirmSaveButton>
	)
}
