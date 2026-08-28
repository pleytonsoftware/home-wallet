import type { UpdateTransactionInput } from '@lib/schemas/transaction/update-transaction'

import { updateTransaction } from '@actions/transaction/update'
import { mutationOptions } from '@tanstack/react-query'

type UpdateTransactionResponse = Awaited<ReturnType<typeof updateTransaction>>

export const updateTransactionMutationOptions = (
	transactionId: string,
	opts?: Omit<Parameters<typeof mutationOptions<UpdateTransactionResponse, unknown, UpdateTransactionInput, unknown>>[0], 'mutationFn'>,
) =>
	mutationOptions({
		mutationFn: async (input: UpdateTransactionInput) => updateTransaction(transactionId, input),
		...opts,
	})
