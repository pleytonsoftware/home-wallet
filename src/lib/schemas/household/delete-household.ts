import type { NestedKey, useTranslations } from 'next-intl'

import { z } from 'zod'

export const DANGER_SETTINGS_NAMESPACE = 'settings.danger' satisfies NestedKey
export const buildDeleteConfirmationSchema = (name: string, t: ReturnType<typeof useTranslations<typeof DANGER_SETTINGS_NAMESPACE>>) =>
	z.object({
		confirmName: z.string().refine((value) => value === name, {
			message: t('delete.name-mismatch-error'),
		}),
	})

export type DeleteHouseholdInput = z.infer<ReturnType<typeof buildDeleteConfirmationSchema>>
