import { createMonthlyBudgetSchema } from './create-monthly-budget'

const t = ((key: string) => key) as Parameters<typeof createMonthlyBudgetSchema>[0]

describe('createMonthlyBudgetSchema', () => {
	const schema = createMonthlyBudgetSchema(t)

	it('accepts a valid payload', () => {
		const result = schema.safeParse({ month: '2026-08', targetAmount: 2200 })
		expect(result.success).toBe(true)
	})

	it.each(['2026-13', '2026-00', '2026/08', '26-08', 'not-a-month'])('rejects an invalid month value: %s', (value) => {
		const result = schema.safeParse({ month: value, targetAmount: 2200 })
		expect(result.success).toBe(false)
	})

	it('rejects a zero target amount', () => {
		const result = schema.safeParse({ month: '2026-08', targetAmount: 0 })
		expect(result.success).toBe(false)
	})

	it('rejects a negative target amount', () => {
		const result = schema.safeParse({ month: '2026-08', targetAmount: -100 })
		expect(result.success).toBe(false)
	})

	it('accepts a missing target amount — it is optional', () => {
		const result = schema.safeParse({ month: '2026-08' })
		expect(result.success).toBe(true)
	})

	it('rejects a non-numeric target amount', () => {
		const result = schema.safeParse({ month: '2026-08', targetAmount: '2200' })
		expect(result.success).toBe(false)
	})
})
