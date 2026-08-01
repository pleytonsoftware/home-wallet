import type { UpdateHouseholdSettingsInput } from '@lib/schemas/household/update-household-settings'

import { updateHouseholdSettings } from '@actions/household/update-settings'
import { mutationOptions } from '@tanstack/react-query'

type UpdateHouseholdSettingsResponse = Awaited<ReturnType<typeof updateHouseholdSettings>>

export const updateHouseholdSettingsMutationOptions = (
	householdId: string,
	opts?: Omit<Parameters<typeof mutationOptions<UpdateHouseholdSettingsResponse, unknown, UpdateHouseholdSettingsInput, unknown>>[0], 'mutationFn'>,
) =>
	mutationOptions({
		mutationFn: async (input: UpdateHouseholdSettingsInput) => updateHouseholdSettings(householdId, input),
		...opts,
	})
