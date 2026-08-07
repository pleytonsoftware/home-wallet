import { CATEGORY_COLOR } from '@lib/constants/category-color.enum'
import { logger } from '@lib/logger'
import { prisma } from '@lib/prisma'

const DEFAULT_CATEGORIES: Array<{ name: string; color: CATEGORY_COLOR }> = [
	{ name: 'Groceries', color: CATEGORY_COLOR.GREEN },
	{ name: 'Rent', color: CATEGORY_COLOR.INDIGO },
	{ name: 'Utilities', color: CATEGORY_COLOR.CYAN },
	{ name: 'Transport', color: CATEGORY_COLOR.BLUE },
	{ name: 'Dining', color: CATEGORY_COLOR.ORANGE },
	{ name: 'Entertainment', color: CATEGORY_COLOR.VIOLET },
	{ name: 'Health', color: CATEGORY_COLOR.RED },
	{ name: 'Shopping', color: CATEGORY_COLOR.PINK },
	{ name: 'Subscriptions', color: CATEGORY_COLOR.TEAL },
	{ name: 'Income', color: CATEGORY_COLOR.LIME },
	{ name: 'Travel', color: CATEGORY_COLOR.AMBER },
	{ name: 'Education', color: CATEGORY_COLOR.YELLOW },
	{ name: 'Other', color: CATEGORY_COLOR.GRAY },
]

async function main() {
	// `@@unique([name, householdId])` can't be queried with a null householdId via upsert's
	// compound-key shorthand, so base (global) categories go through findFirst + create/update.
	for (const category of DEFAULT_CATEGORIES) {
		const existing = await prisma.category.findFirst({ where: { name: category.name, householdId: null } })

		if (existing) {
			await prisma.category.update({ where: { id: existing.id }, data: { color: category.color } })
		} else {
			await prisma.category.create({ data: { name: category.name, color: category.color, isBase: true, householdId: null } })
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
