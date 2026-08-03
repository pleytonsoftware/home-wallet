import type { NestedKey, useTranslations } from 'next-intl'

import { z } from 'zod'

import { ACCOUNT_TYPE } from '@lib/constants/account.enum'
import {
	BANK_ACCOUNT_LAST_FOUR_DIGITS_REGEX,
	MAX_BANK_ACCOUNT_NAME_LENGTH,
	MIN_BANK_ACCOUNT_NAME_LENGTH,
} from '@lib/schemas/bank-account/create-bank-account'

/**
 * The schema reuses the existing bank-account-create error copy so validation messages stay
 * consistent between the create and edit forms.
 */
const __namespace = 'common.forms.bank-accounts.create' satisfies NestedKey

export const updateBankAccountSchema = (t: ReturnType<typeof useTranslations<typeof __namespace>>) =>
	z.object({
		name: z
			.string()
			.trim()
			.min(MIN_BANK_ACCOUNT_NAME_LENGTH, t('name.error.required'))
			.max(MAX_BANK_ACCOUNT_NAME_LENGTH, t('name.error.max-length', { max: MAX_BANK_ACCOUNT_NAME_LENGTH })),
		type: z.enum(ACCOUNT_TYPE, t('type.error.required')),
		lastFourDigits: z
			.string()
			.trim()
			.refine((value) => value === '' || BANK_ACCOUNT_LAST_FOUR_DIGITS_REGEX.test(value), t('last-four-digits.error.invalid'))
			.optional(),
		sharedMemberIds: z.array(z.string()),
	})

export type UpdateBankAccountInput = z.infer<ReturnType<typeof updateBankAccountSchema>>
