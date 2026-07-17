import { joinHousehold, type JoinHouseholdResult } from '@actions/household/join'
import { mutationOptions } from '@tanstack/react-query'

export const joinHouseholdMutationOptions = (
	opts?: Omit<Parameters<typeof mutationOptions<JoinHouseholdResult, unknown, string, unknown>>[0], 'mutationFn'>,
) =>
	mutationOptions({
		mutationFn: async (code: string) => joinHousehold(code),
		...opts,
	})
