import { ACCOUNT_TYPE } from '@lib/constants/account.enum'

import { updateBankAccountSchema } from './update-bank-account'

const t = ((key: string) => key) as Parameters<typeof updateBankAccountSchema>[0]

describe('updateBankAccountSchema', () => {
	const schema = updateBankAccountSchema(t)

	it('accepts a full valid payload', () => {
		const result = schema.safeParse({ name: 'Checking', type: ACCOUNT_TYPE.CREDIT_CARD, lastFourDigits: '5678', sharedMemberIds: ['m2'] })
		expect(result.success).toBe(true)
	})

	it('rejects a missing type (no default at the schema level)', () => {
		const result = schema.safeParse({ name: 'Checking', sharedMemberIds: [] })
		expect(result.success).toBe(false)
	})

	it('rejects an empty name', () => {
		const result = schema.safeParse({ name: '', type: ACCOUNT_TYPE.BANK, sharedMemberIds: [] })
		expect(result.success).toBe(false)
	})
})
