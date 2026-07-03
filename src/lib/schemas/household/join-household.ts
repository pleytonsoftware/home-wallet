import type { NestedKey, useTranslations } from 'next-intl'

import { z } from 'zod'

import { isValidInviteCode } from '@lib/utils/invite-code.utils'

const __namespace = 'onboarding.join.form' satisfies NestedKey

export const MIN_HOUSEHOLD_INVITE_CODE_LENGTH = 1
export const MAX_HOUSEHOLD_INVITE_CODE_LENGTH = 6
export const joinHouseholdSchema = (t: ReturnType<typeof useTranslations<typeof __namespace>>) =>
	z.object({
		code: z
			.string()
			.trim()
			.min(MIN_HOUSEHOLD_INVITE_CODE_LENGTH, t('invite-code.error.required'))
			.max(MAX_HOUSEHOLD_INVITE_CODE_LENGTH, t('invite-code.error.max-length', { max: MAX_HOUSEHOLD_INVITE_CODE_LENGTH }))
			.refine((code) => isValidInviteCode(code), t('invite-code.error.invalid')),
	})

export type JoinHouseholdInput = z.infer<ReturnType<typeof joinHouseholdSchema>>
