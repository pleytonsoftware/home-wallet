import { PAYMENT_TYPE } from '@lib/constants/payment.enum'

import { createTransactionsBatchSchema, MAX_BATCH_ROWS } from './create-transactions-batch'

const t = ((key: string) => key) as Parameters<typeof createTransactionsBatchSchema>[0]

const ROW = {
	name: 'Groceries',
	amount: 42.5,
	type: PAYMENT_TYPE.EXPENSE,
	date: new Date('2026-08-15T00:00:00.000Z'),
	isRecurring: false,
}

describe('createTransactionsBatchSchema', () => {
	const schema = createTransactionsBatchSchema(t)

	it('accepts a single valid row', () => {
		const result = schema.safeParse({ rows: [ROW] })
		expect(result.success).toBe(true)
	})

	it('accepts multiple valid rows', () => {
		const result = schema.safeParse({ rows: [ROW, { ...ROW, name: 'Coffee', amount: 3.5 }] })
		expect(result.success).toBe(true)
	})

	it('rejects an empty rows array', () => {
		const result = schema.safeParse({ rows: [] })
		expect(result.success).toBe(false)
	})

	it(`rejects more than ${MAX_BATCH_ROWS} rows`, () => {
		const rows = Array.from({ length: MAX_BATCH_ROWS + 1 }, () => ({ ...ROW }))
		const result = schema.safeParse({ rows })
		expect(result.success).toBe(false)
	})

	it(`accepts exactly ${MAX_BATCH_ROWS} rows`, () => {
		const rows = Array.from({ length: MAX_BATCH_ROWS }, () => ({ ...ROW }))
		const result = schema.safeParse({ rows })
		expect(result.success).toBe(true)
	})

	it('nests a single invalid row error under its row index', () => {
		const result = schema.safeParse({ rows: [ROW, { ...ROW, name: '' }] })

		expect(result.success).toBe(false)
		if (!result.success) {
			expect(result.error.issues[0]?.path).toEqual(['rows', 1, 'name'])
		}
	})

	it('reports issues for every invalid row, not just the first', () => {
		const result = schema.safeParse({ rows: [{ ...ROW, name: '' }, { ...ROW, amount: 0 }, ROW] })

		expect(result.success).toBe(false)
		if (!result.success) {
			const paths = result.error.issues.map((issue) => issue.path)
			expect(paths).toContainEqual(['rows', 0, 'name'])
			expect(paths).toContainEqual(['rows', 1, 'amount'])
		}
	})
})
