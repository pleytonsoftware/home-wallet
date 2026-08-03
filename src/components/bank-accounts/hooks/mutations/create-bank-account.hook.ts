import type { CreateBankAccountInput } from '@lib/schemas/bank-account/create-bank-account'

import { createBankAccount } from '@actions/bank-account/create'
import { mutationOptions } from '@tanstack/react-query'

type CreateBankAccountResponse = Awaited<ReturnType<typeof createBankAccount>>

export const createBankAccountMutationOptions = (
	householdId: string,
	opts?: Omit<Parameters<typeof mutationOptions<CreateBankAccountResponse, unknown, CreateBankAccountInput, unknown>>[0], 'mutationFn'>,
) =>
	mutationOptions({
		mutationFn: async (input: CreateBankAccountInput) => createBankAccount(householdId, input),
		...opts,
	})
