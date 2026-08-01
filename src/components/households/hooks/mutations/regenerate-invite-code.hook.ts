import { regenerateInviteCode } from '@actions/household/danger'
import { mutationOptions } from '@tanstack/react-query'

type RegenerateInviteCodeResponse = Awaited<ReturnType<typeof regenerateInviteCode>>

export const regenerateInviteCodeMutationOptions = (
	householdId: string,
	opts?: Omit<Parameters<typeof mutationOptions<RegenerateInviteCodeResponse, Error, void, unknown>>[0], 'mutationFn'>,
) =>
	mutationOptions({
		mutationFn: async () => regenerateInviteCode(householdId),
		...opts,
	})
