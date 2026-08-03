'use client'

import type { BankAccountSummary } from '@bank-accounts/types'
import type { CreateBankAccountInput } from '@lib/schemas/bank-account/create-bank-account'

import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { ACCOUNT_TYPE } from '@lib/constants/account.enum'
import { createBankAccountSchema } from '@lib/schemas/bank-account/create-bank-account'
import { updateBankAccountSchema } from '@lib/schemas/bank-account/update-bank-account'

interface UseBankAccountFormParams {
	mode: 'create' | 'edit'
	schemaParams: Parameters<typeof createBankAccountSchema>[0]
	initialData?: BankAccountSummary
}

export const useBankAccountForm = ({ mode, schemaParams, initialData }: UseBankAccountFormParams) =>
	useForm<CreateBankAccountInput>({
		resolver: zodResolver(mode === 'create' ? createBankAccountSchema(schemaParams) : updateBankAccountSchema(schemaParams)),
		defaultValues: {
			name: initialData?.name ?? '',
			type: initialData?.type ?? ACCOUNT_TYPE.BANK,
			lastFourDigits: initialData?.lastFourDigits ?? '',
			sharedMemberIds: initialData?.sharedWith.map((member) => member.id) ?? [],
		},
	})
