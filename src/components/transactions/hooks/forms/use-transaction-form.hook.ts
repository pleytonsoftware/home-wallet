'use client'

import type { CreateTransactionInput } from '@lib/schemas/transaction/create-transaction'
import type { CreateEditMode } from '@lib/types/mode'
import type { TransactionSummary } from '@transactions/types'

import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { PAYMENT_TYPE } from '@lib/constants/payment.enum'
import { createTransactionSchema } from '@lib/schemas/transaction/create-transaction'
import { updateTransactionSchema } from '@lib/schemas/transaction/update-transaction'

interface UseTransactionFormParams {
	mode: CreateEditMode
	schemaParams: Parameters<typeof createTransactionSchema>[0]
	initialData?: TransactionSummary
	/** Default date for a new transaction — the currently viewed month's first day, or today when it's the current month. */
	defaultDate: Date
}

export const useTransactionForm = ({ mode, schemaParams, initialData, defaultDate }: UseTransactionFormParams) =>
	useForm<CreateTransactionInput>({
		resolver: zodResolver(mode === 'create' ? createTransactionSchema(schemaParams) : updateTransactionSchema(schemaParams)),
		mode: 'onChange',
		defaultValues: {
			name: initialData?.name ?? '',
			amount: initialData?.amount ?? ('' as unknown as number),
			type: initialData?.type ?? PAYMENT_TYPE.EXPENSE,
			categoryId: initialData?.category?.id,
			sourceAccountId: initialData?.sourceAccount?.id,
			note: initialData?.note ?? '',
			date: initialData ? new Date(initialData.date) : defaultDate,
			isRecurring: initialData?.isRecurring ?? false,
			recurrenceRule: initialData?.recurrenceRule
				? {
						frequency: initialData.recurrenceRule.frequency,
						interval: initialData.recurrenceRule.interval,
						endDate: initialData.recurrenceRule.endDate ? new Date(initialData.recurrenceRule.endDate) : undefined,
						occurrences: initialData.recurrenceRule.occurrences,
					}
				: undefined,
		},
	})
