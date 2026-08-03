import type { UpdateBankAccountInput } from '@lib/schemas/bank-account/update-bank-account'

import { updateBankAccount } from '@actions/bank-account/update'
import { mutationOptions } from '@tanstack/react-query'

type UpdateBankAccountResponse = Awaited<ReturnType<typeof updateBankAccount>>

export const updateBankAccountMutationOptions = (
	bankAccountId: string,
	opts?: Omit<Parameters<typeof mutationOptions<UpdateBankAccountResponse, unknown, UpdateBankAccountInput, unknown>>[0], 'mutationFn'>,
) =>
	mutationOptions({
		mutationFn: async (input: UpdateBankAccountInput) => updateBankAccount(bankAccountId, input),
		...opts,
	})
