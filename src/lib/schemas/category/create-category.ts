import type { NestedKey, useTranslations } from 'next-intl'

import { z } from 'zod'

import { CATEGORY_COLOR } from '@lib/constants/category-color.enum'
import { CATEGORY_ICON } from '@lib/constants/category-icon.enum'

export const MIN_CATEGORY_NAME_LENGTH = 1
export const MAX_CATEGORY_NAME_LENGTH = 30
const __namespace = 'common.forms.categories.create' satisfies NestedKey

export const createCategorySchema = (t: ReturnType<typeof useTranslations<typeof __namespace>>) =>
	z.object({
		name: z
			.string()
			.trim()
			.min(MIN_CATEGORY_NAME_LENGTH, t('name.error.required'))
			.max(MAX_CATEGORY_NAME_LENGTH, t('name.error.max-length', { max: MAX_CATEGORY_NAME_LENGTH })),
		color: z.enum(CATEGORY_COLOR, t('color.error.required')),
		icon: z.enum(CATEGORY_ICON, t('icon.error.required')),
	})

export type CreateCategoryInput = z.infer<ReturnType<typeof createCategorySchema>>
