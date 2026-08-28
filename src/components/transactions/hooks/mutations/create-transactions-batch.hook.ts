import type { CreateTransactionsBatchInput } from '@lib/schemas/transaction/create-transactions-batch'

import { createTransactionsBatch } from '@actions/transaction/create-batch'
import { mutationOptions } from '@tanstack/react-query'

type CreateTransactionsBatchResponse = Awaited<ReturnType<typeof createTransactionsBatch>>

export const createTransactionsBatchMutationOptions = (
	monthlyBudgetId: string,
	opts?: Omit<Parameters<typeof mutationOptions<CreateTransactionsBatchResponse, unknown, CreateTransactionsBatchInput, unknown>>[0], 'mutationFn'>,
) =>
	mutationOptions({
		mutationFn: async (input: CreateTransactionsBatchInput) => createTransactionsBatch(monthlyBudgetId, input),
		...opts,
	})
