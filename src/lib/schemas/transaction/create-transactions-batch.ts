import type { NestedKey, useTranslations } from 'next-intl'

import { z } from 'zod'

import { createTransactionSchema } from '@lib/schemas/transaction/create-transaction'

export const MAX_BATCH_ROWS = 50

const __namespace = 'common.forms.transactions.create' satisfies NestedKey

/** Draft-mode ("Save all") batch schema — reuses `createTransactionSchema(t)` verbatim as the array's element schema. */
export const createTransactionsBatchSchema = (t: ReturnType<typeof useTranslations<typeof __namespace>>) =>
	z.object({
		rows: z
			.array(createTransactionSchema(t))
			.min(1, t('batch.error.empty'))
			.max(MAX_BATCH_ROWS, t('batch.error.max-rows', { max: MAX_BATCH_ROWS })),
	})

export type CreateTransactionsBatchInput = z.infer<ReturnType<typeof createTransactionsBatchSchema>>
