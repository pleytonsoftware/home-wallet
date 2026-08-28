import { CATEGORY_COLOR } from '@lib/constants/category-color.enum'
import { CATEGORY_ICON } from '@lib/constants/category-icon.enum'

import { hashCategoryColor, hashCategoryIcon } from './utils'

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

describe('hashCategoryIcon', () => {
	it('returns a valid CATEGORY_ICON', () => {
		expect(Object.values(CATEGORY_ICON)).toContain(hashCategoryIcon('Groceries'))
	})

	it('is deterministic for the same name', () => {
		expect(hashCategoryIcon('Groceries')).toBe(hashCategoryIcon('Groceries'))
	})

	it('tends to differ for different names', () => {
		expect(hashCategoryIcon('Groceries')).not.toBe(hashCategoryIcon('Rent'))
	})
})
