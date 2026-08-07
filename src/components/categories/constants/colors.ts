import { CATEGORY_COLOR } from '@lib/constants/category-color.enum'

interface CategoryColorClasses {
	/** Light tint background + saturated text — used by `CategoryBadge`. */
	badge: string
	/** Solid, fully-saturated background — used by the color-swatch picker. */
	swatch: string
}

export const CATEGORY_COLOR_CLASSES: Record<CATEGORY_COLOR, CategoryColorClasses> = {
	[CATEGORY_COLOR.RED]: { badge: 'bg-red-500/10 text-red-600 dark:text-red-400', swatch: 'bg-red-500' },
	[CATEGORY_COLOR.ORANGE]: { badge: 'bg-orange-500/10 text-orange-600 dark:text-orange-400', swatch: 'bg-orange-500' },
	[CATEGORY_COLOR.AMBER]: { badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400', swatch: 'bg-amber-500' },
	[CATEGORY_COLOR.YELLOW]: { badge: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400', swatch: 'bg-yellow-500' },
	[CATEGORY_COLOR.LIME]: { badge: 'bg-lime-500/10 text-lime-600 dark:text-lime-400', swatch: 'bg-lime-500' },
	[CATEGORY_COLOR.GREEN]: { badge: 'bg-green-500/10 text-green-600 dark:text-green-400', swatch: 'bg-green-500' },
	[CATEGORY_COLOR.TEAL]: { badge: 'bg-teal-500/10 text-teal-600 dark:text-teal-400', swatch: 'bg-teal-500' },
	[CATEGORY_COLOR.CYAN]: { badge: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400', swatch: 'bg-cyan-500' },
	[CATEGORY_COLOR.BLUE]: { badge: 'bg-blue-500/10 text-blue-600 dark:text-blue-400', swatch: 'bg-blue-500' },
	[CATEGORY_COLOR.INDIGO]: { badge: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400', swatch: 'bg-indigo-500' },
	[CATEGORY_COLOR.VIOLET]: { badge: 'bg-violet-500/10 text-violet-600 dark:text-violet-400', swatch: 'bg-violet-500' },
	[CATEGORY_COLOR.PINK]: { badge: 'bg-pink-500/10 text-pink-600 dark:text-pink-400', swatch: 'bg-pink-500' },
	[CATEGORY_COLOR.GRAY]: { badge: 'bg-muted text-muted-foreground', swatch: 'bg-muted-foreground' },
}
