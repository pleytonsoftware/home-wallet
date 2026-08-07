import { CATEGORY_COLOR } from '@lib/constants/category-color.enum'

import { hashCategoryColor } from './utils'

describe('hashCategoryColor', () => {
	it('returns a valid CATEGORY_COLOR', () => {
		expect(Object.values(CATEGORY_COLOR)).toContain(hashCategoryColor('Groceries'))
	})

	it('is deterministic for the same name', () => {
		expect(hashCategoryColor('Groceries')).toBe(hashCategoryColor('Groceries'))
	})

	it('tends to differ for different names', () => {
		expect(hashCategoryColor('Groceries')).not.toBe(hashCategoryColor('Rent'))
	})
})
