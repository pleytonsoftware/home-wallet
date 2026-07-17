import type { NestedKey, useTranslations } from 'next-intl'

import { codes } from 'currency-codes-ts'
import { z } from 'zod'

import { SplitStrategy } from '@lib/constants/split-strategy.enum'

export const MIN_HOUSEHOLD_NAME_LENGTH = 1
export const MAX_HOUSEHOLD_NAME_LENGTH = 50
const __namespace = 'common.forms.households.create' satisfies NestedKey

export const MAX_HOUSEHOLD_FULL_ADDRESS_LENGTH = 120

/**
 * Extended household creation schema — adds household config fields (currency, default split
 * strategy, auto-categorize) and the optional full address on top of the base `name` field.
 */
export const createHouseholdSchema = (t: ReturnType<typeof useTranslations<typeof __namespace>>) =>
	z.object({
		name: z
			.string()
			.trim()
			.min(MIN_HOUSEHOLD_NAME_LENGTH, t('name.error.required'))
			.max(MAX_HOUSEHOLD_NAME_LENGTH, t('name.error.max-length', { max: MAX_HOUSEHOLD_NAME_LENGTH })),
		currency: z.enum(codes(), t('currency.error.required')).default('EUR'),
		splitStrategy: z.enum(SplitStrategy).default(SplitStrategy.EQUAL),
		autoCategorize: z.boolean().default(true),
		fullAddress: z
			.string()
			.trim()
			.max(MAX_HOUSEHOLD_FULL_ADDRESS_LENGTH, t('full-address.error.max-length', { max: MAX_HOUSEHOLD_FULL_ADDRESS_LENGTH }))
			.optional(),
	})

export type CreateHouseholdConfigInput = z.infer<ReturnType<typeof createHouseholdSchema>>
