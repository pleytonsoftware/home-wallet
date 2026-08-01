import type { MemberRole } from '@lib/constants/role.enum'

import { updateMemberRoles } from '@actions/household/update-member-roles'
import { mutationOptions } from '@tanstack/react-query'

type UpdateMemberRolesResponse = Awaited<ReturnType<typeof updateMemberRoles>>
type UpdateMemberRolesInput = Record<string, MemberRole>

export const updateMemberRolesMutationOptions = (
	householdId: string,
	opts?: Omit<Parameters<typeof mutationOptions<UpdateMemberRolesResponse, unknown, UpdateMemberRolesInput, unknown>>[0], 'mutationFn'>,
) =>
	mutationOptions({
		mutationFn: async (input: UpdateMemberRolesInput) => updateMemberRoles(householdId, input),
		...opts,
	})
