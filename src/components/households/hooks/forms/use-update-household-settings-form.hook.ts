'use client'

import type { HouseholdDetail } from '@households/types'
import type { UpdateHouseholdSettingsInput } from '@lib/schemas/household/update-household-settings'

import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { updateHouseholdSettingsSchema } from '@lib/schemas/household/update-household-settings'

export const useUpdateHouseholdSettingsForm = (
	schemaParams: Parameters<typeof updateHouseholdSettingsSchema>[0],
	household: HouseholdDetail,
	isReadOnly?: boolean,
) =>
	useForm({
		resolver: zodResolver(updateHouseholdSettingsSchema(schemaParams)),
		disabled: isReadOnly,
		defaultValues: {
			name: household.name,
			currency: household.config.currency as UpdateHouseholdSettingsInput['currency'],
			splitStrategy: household.config.defaultSplitStrategy,
			autoCategorize: household.config.autoCategorize,
			aiAssistEnabled: household.config.aiAssistEnabled,
			fullAddress: household.fullAddress ?? '',
		},
	})
