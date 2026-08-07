import { CATEGORY_COLOR } from '@lib/constants/category-color.enum'

const CATEGORY_COLORS = Object.values(CATEGORY_COLOR)

/**
 * Returns a consistent color for a category name.
 *
 * The category name is converted into a numeric hash, which is then used
 * to select a color from `CATEGORY_COLORS`. This means the same category
 * name will always map to the same color without needing to store the
 * mapping anywhere.
 *
 * Note that different category names can still resolve to the same color,
 * since the hash is reduced to the number of available colors.
 *
 * @param name - The category name.
 * @returns A deterministic color from `CATEGORY_COLORS`.
 */
export const hashCategoryColor = (name: string): CATEGORY_COLOR => {
	let hash = 0
	for (let index = 0; index < name.length; index++) {
		hash = (hash * 31 + name.charCodeAt(index)) >>> 0
	}
	return CATEGORY_COLORS[hash % CATEGORY_COLORS.length]
}
