import { deleteBankAccount } from '@actions/bank-account/delete'
import { mutationOptions } from '@tanstack/react-query'

type DeleteBankAccountResponse = Awaited<ReturnType<typeof deleteBankAccount>>

export const deleteBankAccountMutationOptions = (
	bankAccountId: string,
	opts?: Omit<Parameters<typeof mutationOptions<DeleteBankAccountResponse, unknown, void, unknown>>[0], 'mutationFn'>,
) =>
	mutationOptions({
		mutationFn: async () => deleteBankAccount(bankAccountId),
		...opts,
	})
