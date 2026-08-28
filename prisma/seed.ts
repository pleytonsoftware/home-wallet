import { CATEGORY_COLOR } from '@lib/constants/category-color.enum'
import { CATEGORY_ICON } from '@lib/constants/category-icon.enum'
import { logger } from '@lib/logger'
import { prisma } from '@lib/prisma'

const DEFAULT_CATEGORIES: Array<{ name: string; color: CATEGORY_COLOR; icon: CATEGORY_ICON }> = [
	{ name: 'Groceries', color: CATEGORY_COLOR.GREEN, icon: CATEGORY_ICON.SHOPPING_CART },
	{ name: 'Rent', color: CATEGORY_COLOR.INDIGO, icon: CATEGORY_ICON.HOME },
	{ name: 'Utilities', color: CATEGORY_COLOR.CYAN, icon: CATEGORY_ICON.ZAP },
	{ name: 'Transport', color: CATEGORY_COLOR.BLUE, icon: CATEGORY_ICON.CAR },
	{ name: 'Dining', color: CATEGORY_COLOR.ORANGE, icon: CATEGORY_ICON.UTENSILS },
	{ name: 'Entertainment', color: CATEGORY_COLOR.VIOLET, icon: CATEGORY_ICON.FILM },
	{ name: 'Health', color: CATEGORY_COLOR.RED, icon: CATEGORY_ICON.HEART_PULSE },
	{ name: 'Shopping', color: CATEGORY_COLOR.PINK, icon: CATEGORY_ICON.SHOPPING_BAG },
	{ name: 'Subscriptions', color: CATEGORY_COLOR.TEAL, icon: CATEGORY_ICON.REPEAT },
	{ name: 'Income', color: CATEGORY_COLOR.LIME, icon: CATEGORY_ICON.WALLET },
	{ name: 'Travel', color: CATEGORY_COLOR.AMBER, icon: CATEGORY_ICON.PLANE },
	{ name: 'Education', color: CATEGORY_COLOR.YELLOW, icon: CATEGORY_ICON.GRADUATION_CAP },
	{ name: 'Other', color: CATEGORY_COLOR.GRAY, icon: CATEGORY_ICON.TAG },
]

async function main() {
	// `@@unique([name, householdId])` can't be queried with a null householdId via upsert's
	// compound-key shorthand, so base (global) categories go through findFirst + create/update.
	for (const category of DEFAULT_CATEGORIES) {
		const existing = await prisma.category.findFirst({ where: { name: category.name, householdId: null } })

		if (existing) {
			await prisma.category.update({ where: { id: existing.id }, data: { color: category.color, icon: category.icon } })
		} else {
			await prisma.category.create({
				data: { name: category.name, color: category.color, icon: category.icon, isBase: true, householdId: null },
			})
		}
	}
}

main()
	.then(async () => {
		await prisma.$disconnect()
	})
	.catch(async (error) => {
		logger.error('[seed]: {error}', { error })
		await prisma.$disconnect()
		process.exit(1)
	})
