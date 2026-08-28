import type { NestedKey, useTranslations } from 'next-intl'

import { z } from 'zod'

import { PAYMENT_TYPE } from '@lib/constants/payment.enum'
import { RECURRENCE_FREQUENCY } from '@lib/constants/recurrence.enum'
import {
	MAX_TRANSACTION_NAME_LENGTH,
	MAX_TRANSACTION_NOTE_LENGTH,
	MIN_RECURRENCE_INTERVAL,
	MIN_RECURRENCE_OCCURRENCES,
	MIN_TRANSACTION_AMOUNT,
	MIN_TRANSACTION_NAME_LENGTH,
} from '@lib/schemas/transaction/create-transaction'

/** Reuses the create-transaction error copy so validation messages stay consistent between the create and edit forms. */
const __namespace = 'common.forms.transactions.create' satisfies NestedKey

export const updateTransactionSchema = (t: ReturnType<typeof useTranslations<typeof __namespace>>) =>
	z
		.object({
			name: z
				.string()
				.trim()
				.min(MIN_TRANSACTION_NAME_LENGTH, t('name.error.required'))
				.max(MAX_TRANSACTION_NAME_LENGTH, t('name.error.max-length', { max: MAX_TRANSACTION_NAME_LENGTH })),
			amount: z.number(t('amount.error.required')).min(MIN_TRANSACTION_AMOUNT, t('amount.error.positive')),
			type: z.enum(PAYMENT_TYPE, t('type.error.required')),
			categoryId: z.string().optional(),
			sourceAccountId: z.string().optional(),
			note: z
				.string()
				.trim()
				.max(MAX_TRANSACTION_NOTE_LENGTH, t('note.error.max-length', { max: MAX_TRANSACTION_NOTE_LENGTH }))
				.optional(),
			date: z.date(t('date.error.required')),
			isRecurring: z.boolean(),
			recurrenceRule: z
				.object({
					frequency: z.enum(RECURRENCE_FREQUENCY, t('recurrence.frequency.error.required')),
					interval: z.number().int().min(MIN_RECURRENCE_INTERVAL).optional(),
					endDate: z.date().optional(),
					occurrences: z.number().int().min(MIN_RECURRENCE_OCCURRENCES).optional(),
				})
				.optional(),
		})
		.superRefine((data, ctx) => {
			if (data.isRecurring && !data.recurrenceRule) {
				ctx.addIssue({ code: 'custom', path: ['recurrenceRule', 'frequency'], message: t('recurrence.frequency.error.required') })
			}
			if (data.recurrenceRule?.endDate && data.recurrenceRule.occurrences) {
				ctx.addIssue({ code: 'custom', path: ['recurrenceRule', 'endDate'], message: t('recurrence.error.end-conflict') })
			}
		})

export type UpdateTransactionInput = z.infer<ReturnType<typeof updateTransactionSchema>>
