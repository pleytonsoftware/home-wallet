import { leaveHousehold } from '@actions/household/danger'
import { mutationOptions } from '@tanstack/react-query'

type LeaveHouseholdResponse = Awaited<ReturnType<typeof leaveHousehold>>

export const leaveHouseholdMutationOptions = (
	householdId: string,
	opts?: Omit<Parameters<typeof mutationOptions<LeaveHouseholdResponse, Error, void, unknown>>[0], 'mutationFn'>,
) =>
	mutationOptions({
		mutationFn: async () => leaveHousehold(householdId),
		...opts,
	})
