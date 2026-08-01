import { deleteHousehold } from '@actions/household/danger'
import { mutationOptions } from '@tanstack/react-query'

type DeleteHouseholdResponse = Awaited<ReturnType<typeof deleteHousehold>>

export const deleteHouseholdMutationOptions = (
	householdId: string,
	opts?: Omit<Parameters<typeof mutationOptions<DeleteHouseholdResponse, Error, string, unknown>>[0], 'mutationFn'>,
) =>
	mutationOptions({
		mutationFn: async (confirmName: string) => deleteHousehold(householdId, confirmName),
		...opts,
	})
