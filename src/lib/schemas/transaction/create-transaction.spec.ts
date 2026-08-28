import { PAYMENT_TYPE } from '@lib/constants/payment.enum'
import { RECURRENCE_FREQUENCY } from '@lib/constants/recurrence.enum'

import { createTransactionSchema, MAX_TRANSACTION_NAME_LENGTH } from './create-transaction'

const t = ((key: string) => key) as Parameters<typeof createTransactionSchema>[0]

const BASE_PAYLOAD = {
	name: 'Groceries',
	amount: 42.5,
	type: PAYMENT_TYPE.EXPENSE,
	date: new Date('2026-08-15T00:00:00.000Z'),
	isRecurring: false,
}

describe('createTransactionSchema', () => {
	const schema = createTransactionSchema(t)

	it('accepts a minimal valid payload', () => {
		const result = schema.safeParse(BASE_PAYLOAD)
		expect(result.success).toBe(true)
	})

	it('rejects an empty name', () => {
		const result = schema.safeParse({ ...BASE_PAYLOAD, name: '' })
		expect(result.success).toBe(false)
	})

	it('rejects a name longer than the max length', () => {
		const result = schema.safeParse({ ...BASE_PAYLOAD, name: 'a'.repeat(MAX_TRANSACTION_NAME_LENGTH + 1) })
		expect(result.success).toBe(false)
	})

	it('rejects a zero or negative amount', () => {
		expect(schema.safeParse({ ...BASE_PAYLOAD, amount: 0 }).success).toBe(false)
		expect(schema.safeParse({ ...BASE_PAYLOAD, amount: -5 }).success).toBe(false)
	})

	it('rejects an invalid type', () => {
		const result = schema.safeParse({ ...BASE_PAYLOAD, type: 'transfer' })
		expect(result.success).toBe(false)
	})

	it('rejects a missing date', () => {
		const { date: _date, ...rest } = BASE_PAYLOAD
		const result = schema.safeParse(rest)
		expect(result.success).toBe(false)
	})

	it('accepts optional categoryId, sourceAccountId and note', () => {
		const result = schema.safeParse({ ...BASE_PAYLOAD, categoryId: 'c1', sourceAccountId: 'a1', note: 'Weekly shop' })
		expect(result.success).toBe(true)
	})

	it('requires a recurrenceRule when isRecurring is true', () => {
		const result = schema.safeParse({ ...BASE_PAYLOAD, isRecurring: true })
		expect(result.success).toBe(false)
	})

	it('accepts a recurring transaction with a valid recurrenceRule', () => {
		const result = schema.safeParse({
			...BASE_PAYLOAD,
			isRecurring: true,
			recurrenceRule: { frequency: RECURRENCE_FREQUENCY.MONTHLY, interval: 1 },
		})
		expect(result.success).toBe(true)
	})

	it('rejects a recurrenceRule with both endDate and occurrences set', () => {
		const result = schema.safeParse({
			...BASE_PAYLOAD,
			isRecurring: true,
			recurrenceRule: {
				frequency: RECURRENCE_FREQUENCY.MONTHLY,
				endDate: new Date('2027-01-01T00:00:00.000Z'),
				occurrences: 6,
			},
		})
		expect(result.success).toBe(false)
	})

	it('accepts a recurrenceRule with only endDate', () => {
		const result = schema.safeParse({
			...BASE_PAYLOAD,
			isRecurring: true,
			recurrenceRule: { frequency: RECURRENCE_FREQUENCY.WEEKLY, endDate: new Date('2027-01-01T00:00:00.000Z') },
		})
		expect(result.success).toBe(true)
	})

	it('accepts a recurrenceRule with only occurrences', () => {
		const result = schema.safeParse({
			...BASE_PAYLOAD,
			isRecurring: true,
			recurrenceRule: { frequency: RECURRENCE_FREQUENCY.WEEKLY, occurrences: 6 },
		})
		expect(result.success).toBe(true)
	})
})
