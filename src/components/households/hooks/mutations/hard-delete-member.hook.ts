import { hardDeletePreviousMember } from '@actions/household/hard-delete-member'
import { mutationOptions } from '@tanstack/react-query'

type HardDeletePreviousMemberResponse = Awaited<ReturnType<typeof hardDeletePreviousMember>>

export const hardDeletePreviousMemberMutationOptions = (
	householdId: string,
	opts?: Omit<Parameters<typeof mutationOptions<HardDeletePreviousMemberResponse, unknown, string, unknown>>[0], 'mutationFn'>,
) =>
	mutationOptions({
		mutationFn: async (targetMembershipId: string) => hardDeletePreviousMember(householdId, targetMembershipId),
		...opts,
	})
