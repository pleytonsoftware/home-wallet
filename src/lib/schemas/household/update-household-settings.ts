import type { NestedKey, useTranslations } from 'next-intl'

import { codes } from 'currency-codes-ts'
import { z } from 'zod'

import { SplitStrategy } from '@lib/constants/split-strategy.enum'
import { MAX_HOUSEHOLD_FULL_ADDRESS_LENGTH, MAX_HOUSEHOLD_NAME_LENGTH, MIN_HOUSEHOLD_NAME_LENGTH } from '@lib/schemas/household/create-household'

/**
 * The schema reuses the existing household-create error copy so validation messages stay
 * consistent between the onboarding form and the settings form.
 */
const __namespace = 'common.forms.households.create' satisfies NestedKey

/**
 * Editable household settings: household identity (name, address) + config
 * (currency, split strategy, auto-categorize, AI assist).
 */
export const updateHouseholdSettingsSchema = (t: ReturnType<typeof useTranslations<typeof __namespace>>) =>
	z.object({
		name: z
			.string()
			.trim()
			.min(MIN_HOUSEHOLD_NAME_LENGTH, t('name.error.required'))
			.max(MAX_HOUSEHOLD_NAME_LENGTH, t('name.error.max-length', { max: MAX_HOUSEHOLD_NAME_LENGTH })),
		currency: z.enum(codes(), t('currency.error.required')),
		splitStrategy: z.enum(SplitStrategy),
		autoCategorize: z.boolean(),
		aiAssistEnabled: z.boolean(),
		fullAddress: z
			.string()
			.trim()
			.max(MAX_HOUSEHOLD_FULL_ADDRESS_LENGTH, t('full-address.error.max-length', { max: MAX_HOUSEHOLD_FULL_ADDRESS_LENGTH }))
			.optional(),
	})

export type UpdateHouseholdSettingsInput = z.infer<ReturnType<typeof updateHouseholdSettingsSchema>>
