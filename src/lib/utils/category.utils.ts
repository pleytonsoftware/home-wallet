import type { CategorySummary } from '@categories/types'

export const INCOME_CATEGORY_NAME = 'Income'

/** Whether a category is the reserved, global "Income" base category (matched case-insensitively). */
export const isIncomeCategory = (category: Pick<CategorySummary, 'name' | 'isBase'>): boolean =>
	category.isBase && category.name.trim().toLowerCase() === INCOME_CATEGORY_NAME.toLowerCase()
