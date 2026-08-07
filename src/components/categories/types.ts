import type { CATEGORY_COLOR } from '@lib/constants/category-color.enum'

export interface CategorySummary {
	id: string
	name: string
	color: CATEGORY_COLOR
	isBase: boolean
}

export interface CreateCategoryPayload {
	name: string
	color: CATEGORY_COLOR
}
