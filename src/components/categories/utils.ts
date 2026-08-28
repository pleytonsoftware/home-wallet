import { CATEGORY_COLOR } from '@lib/constants/category-color.enum'
import { CATEGORY_ICON } from '@lib/constants/category-icon.enum'

const CATEGORY_COLORS = Object.values(CATEGORY_COLOR)
const CATEGORY_ICONS = Object.values(CATEGORY_ICON)

const hashString = (value: string): number => {
	let hash = 0
	for (let index = 0; index < value.length; index++) {
		hash = (hash * 31 + value.charCodeAt(index)) >>> 0
	}
	return hash
}

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
export const hashCategoryColor = (name: string): CATEGORY_COLOR => CATEGORY_COLORS[hashString(name) % CATEGORY_COLORS.length]

/**
 * Returns a consistent icon for a category name, using the same deterministic-hash approach as
 * `hashCategoryColor` — a differently-salted hash so a name's suggested color and icon don't
 * always land on the same relative index.
 *
 * @param name - The category name.
 * @returns A deterministic icon from `CATEGORY_ICONS`.
 */
export const hashCategoryIcon = (name: string): CATEGORY_ICON => CATEGORY_ICONS[hashString(`${name}:icon`) % CATEGORY_ICONS.length]
