import { ACCOUNT_TYPE } from '@lib/constants/account.enum'

import { createBankAccountSchema, MAX_BANK_ACCOUNT_NAME_LENGTH } from './create-bank-account'

const t = ((key: string) => key) as Parameters<typeof createBankAccountSchema>[0]

describe('createBankAccountSchema', () => {
	const schema = createBankAccountSchema(t)

	it('accepts a minimal valid payload', () => {
		const result = schema.safeParse({ name: 'Checking', type: ACCOUNT_TYPE.BANK, sharedMemberIds: [] })
		expect(result.success).toBe(true)
	})

	it('rejects an empty name', () => {
		const result = schema.safeParse({ name: '', type: ACCOUNT_TYPE.BANK, sharedMemberIds: [] })
		expect(result.success).toBe(false)
	})

	it('rejects a name longer than the max length', () => {
		const result = schema.safeParse({ name: 'a'.repeat(MAX_BANK_ACCOUNT_NAME_LENGTH + 1), type: ACCOUNT_TYPE.BANK, sharedMemberIds: [] })
		expect(result.success).toBe(false)
	})

	it('rejects an invalid account type', () => {
		const result = schema.safeParse({ name: 'Checking', type: 'crypto', sharedMemberIds: [] })
		expect(result.success).toBe(false)
	})

	it('accepts an empty lastFourDigits (no digits entered yet)', () => {
		const result = schema.safeParse({ name: 'Checking', type: ACCOUNT_TYPE.CASH, lastFourDigits: '', sharedMemberIds: [] })
		expect(result.success).toBe(true)
	})

	it('accepts exactly 4 digits for lastFourDigits', () => {
		const result = schema.safeParse({ name: 'Checking', type: ACCOUNT_TYPE.BANK, lastFourDigits: '1234', sharedMemberIds: [] })
		expect(result.success).toBe(true)
	})

	it.each(['123', '12345', 'abcd'])('rejects an invalid lastFourDigits value: %s', (value) => {
		const result = schema.safeParse({ name: 'Checking', type: ACCOUNT_TYPE.BANK, lastFourDigits: value, sharedMemberIds: [] })
		expect(result.success).toBe(false)
	})

	it('requires sharedMemberIds to be present', () => {
		const result = schema.safeParse({ name: 'Checking', type: ACCOUNT_TYPE.BANK })
		expect(result.success).toBe(false)
	})
})
