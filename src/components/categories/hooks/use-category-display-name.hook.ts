import { useCallback } from 'react'

import { useTranslations } from 'next-intl'

const slugify = (name: string) => name.trim().toLowerCase().replace(/\s+/g, '-')

/** Translates base category names for display; household-created categories are shown as typed. */
export const useCategoryDisplayName = () => {
	const t = useTranslations('common.fields.category.base')

	return useCallback(
		(category: { name: string; isBase: boolean }) => {
			if (!category.isBase) return category.name
			const slug = slugify(category.name) as never
			return t.has(slug) ? t(slug) : category.name
		},
		[t],
	)
}
