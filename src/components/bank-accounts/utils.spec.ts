import { formatBankAccountLabel } from './utils'

describe('formatBankAccountLabel', () => {
	it('appends the masked last-4-digits suffix when present', () => {
		expect(formatBankAccountLabel({ name: 'Checking', lastFourDigits: '1234' })).toBe('Checking · •••• 1234')
	})

	it('returns just the name when there are no last-4-digits', () => {
		expect(formatBankAccountLabel({ name: 'Checking', lastFourDigits: null })).toBe('Checking')
	})
})
