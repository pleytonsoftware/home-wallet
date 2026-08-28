import { deleteTransaction } from '@actions/transaction/delete'
import { mutationOptions } from '@tanstack/react-query'

type DeleteTransactionResponse = Awaited<ReturnType<typeof deleteTransaction>>
type DeleteTransactionVariables = { cancelSeries?: boolean } | void

export const deleteTransactionMutationOptions = (
	transactionId: string,
	opts?: Omit<Parameters<typeof mutationOptions<DeleteTransactionResponse, unknown, DeleteTransactionVariables, unknown>>[0], 'mutationFn'>,
) =>
	mutationOptions({
		mutationFn: async (variables: DeleteTransactionVariables) => deleteTransaction(transactionId, variables ?? undefined),
		...opts,
	})
