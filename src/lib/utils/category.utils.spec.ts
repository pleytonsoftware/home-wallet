import { isIncomeCategory } from './category.utils'

describe('isIncomeCategory', () => {
	it('returns true for the base category named "Income"', () => {
		expect(isIncomeCategory({ name: 'Income', isBase: true })).toBe(true)
	})

	it('matches case-insensitively and ignores surrounding whitespace', () => {
		expect(isIncomeCategory({ name: '  income  ', isBase: true })).toBe(true)
		expect(isIncomeCategory({ name: 'INCOME', isBase: true })).toBe(true)
	})

	it('returns false for other base categories', () => {
		expect(isIncomeCategory({ name: 'Groceries', isBase: true })).toBe(false)
	})

	it('returns false for a household-created category named "Income" (not a base category)', () => {
		expect(isIncomeCategory({ name: 'Income', isBase: false })).toBe(false)
	})
})
