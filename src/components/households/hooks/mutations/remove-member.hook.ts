import { removeMember } from '@actions/household/remove-member'
import { mutationOptions } from '@tanstack/react-query'

type RemoveMemberResponse = Awaited<ReturnType<typeof removeMember>>

export const removeMemberMutationOptions = (
	householdId: string,
	opts?: Omit<Parameters<typeof mutationOptions<RemoveMemberResponse, unknown, string, unknown>>[0], 'mutationFn'>,
) =>
	mutationOptions({
		mutationFn: async (targetMembershipId: string) => removeMember(householdId, targetMembershipId),
		...opts,
	})
