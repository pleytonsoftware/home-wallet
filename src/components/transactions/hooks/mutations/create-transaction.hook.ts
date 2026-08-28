import type { CreateTransactionInput } from '@lib/schemas/transaction/create-transaction'

import { createTransaction } from '@actions/transaction/create'
import { mutationOptions } from '@tanstack/react-query'

type CreateTransactionResponse = Awaited<ReturnType<typeof createTransaction>>

export const createTransactionMutationOptions = (
	monthlyBudgetId: string,
	opts?: Omit<Parameters<typeof mutationOptions<CreateTransactionResponse, unknown, CreateTransactionInput, unknown>>[0], 'mutationFn'>,
) =>
	mutationOptions({
		mutationFn: async (input: CreateTransactionInput) => createTransaction(monthlyBudgetId, input),
		...opts,
	})
