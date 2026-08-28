import { CATEGORY_COLOR } from '@lib/constants/category-color.enum'
import { CATEGORY_ICON } from '@lib/constants/category-icon.enum'

import { createCategorySchema, MAX_CATEGORY_NAME_LENGTH } from './create-category'

const t = ((key: string) => key) as Parameters<typeof createCategorySchema>[0]

describe('createCategorySchema', () => {
	const schema = createCategorySchema(t)

	it('accepts a valid payload', () => {
		const result = schema.safeParse({ name: 'Groceries', color: CATEGORY_COLOR.GREEN, icon: CATEGORY_ICON.SHOPPING_CART })
		expect(result.success).toBe(true)
	})

	it('trims the name', () => {
		const result = schema.safeParse({ name: '  Groceries  ', color: CATEGORY_COLOR.GREEN, icon: CATEGORY_ICON.SHOPPING_CART })
		expect(result.success && result.data.name).toBe('Groceries')
	})

	it('rejects an empty name', () => {
		const result = schema.safeParse({ name: '', color: CATEGORY_COLOR.GREEN, icon: CATEGORY_ICON.SHOPPING_CART })
		expect(result.success).toBe(false)
	})

	it('rejects a name longer than the max length', () => {
		const result = schema.safeParse({
			name: 'a'.repeat(MAX_CATEGORY_NAME_LENGTH + 1),
			color: CATEGORY_COLOR.GREEN,
			icon: CATEGORY_ICON.SHOPPING_CART,
		})
		expect(result.success).toBe(false)
	})

	it('rejects an invalid color', () => {
		const result = schema.safeParse({ name: 'Groceries', color: 'not-a-color', icon: CATEGORY_ICON.SHOPPING_CART })
		expect(result.success).toBe(false)
	})

	it('rejects a missing color', () => {
		const result = schema.safeParse({ name: 'Groceries', icon: CATEGORY_ICON.SHOPPING_CART })
		expect(result.success).toBe(false)
	})

	it('rejects an invalid icon', () => {
		const result = schema.safeParse({ name: 'Groceries', color: CATEGORY_COLOR.GREEN, icon: 'not-an-icon' })
		expect(result.success).toBe(false)
	})

	it('rejects a missing icon', () => {
		const result = schema.safeParse({ name: 'Groceries', color: CATEGORY_COLOR.GREEN })
		expect(result.success).toBe(false)
	})
})
