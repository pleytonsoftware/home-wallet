import { describe, it, expect } from 'vitest'

import { generateInviteCode, isValidInviteCode } from './invite-code.utils'

describe('generateInviteCode', () => {
	it('should return a string of the requested length (default 6)', () => {
		const code = generateInviteCode()
		expect(code).toHaveLength(6)
	})

	it('should return a string of the specified length', () => {
		const code = generateInviteCode(8)
		expect(code).toHaveLength(8)
	})

	it('should produce only uppercase letters and digits', () => {
		const code = generateInviteCode(12)
		expect(code).toMatch(/^[A-Z0-9]+$/)
	})

	it('should produce different codes on successive calls', () => {
		const first = generateInviteCode()
		const second = generateInviteCode()
		expect(first).not.toBe(second)
	})
})

describe('isValidInviteCode', () => {
	const valid = ['ABCDE', 'A1B2C3', '12345', 'ABCDEF']
	const invalid = ['abcde', 'ABCDE!@#', '', 'ABCDEFG']

	describe.each(valid)('valid invite codes', (code) => {
		it(`returns true for valid code ${code}`, () => {
			expect(isValidInviteCode(code)).toBe(true)
		})
	})

	describe.each(invalid)('invalid invite codes', (code) => {
		it(`returns false for invalid code ${code}`, () => {
			expect(isValidInviteCode(code)).toBe(false)
		})
	})
})
