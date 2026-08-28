import type { CATEGORY_COLOR } from '@lib/constants/category-color.enum'
import type { CATEGORY_ICON } from '@lib/constants/category-icon.enum'

export interface CategorySummary {
	id: string
	name: string
	color: CATEGORY_COLOR
	icon: CATEGORY_ICON
	isBase: boolean
}

export interface CreateCategoryPayload {
	name: string
	color: CATEGORY_COLOR
	icon: CATEGORY_ICON
}
