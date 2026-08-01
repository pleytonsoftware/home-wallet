import { describe, it, expect } from 'vitest'

import {
	DEFAULT_INVITE_CODE_REGENERATE_COOLDOWN_MS,
	generateInviteCode,
	getInviteCodeRegenerateCooldownMs,
	isInviteCodeRegenerateOnCooldown,
	isValidInviteCode,
} from './invite-code.utils'

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

describe('getInviteCodeRegenerateCooldownMs', () => {
	afterEach(() => {
		vi.unstubAllEnvs()
	})

	it('returns the default 30-day cooldown when the env var is unset', () => {
		vi.stubEnv('INVITE_CODE_REGENERATE_COOLDOWN_MS', '')
		expect(getInviteCodeRegenerateCooldownMs()).toBe(DEFAULT_INVITE_CODE_REGENERATE_COOLDOWN_MS)
	})

	it('returns the default cooldown when the env var is not a valid positive number', () => {
		vi.stubEnv('INVITE_CODE_REGENERATE_COOLDOWN_MS', 'not-a-number')
		expect(getInviteCodeRegenerateCooldownMs()).toBe(DEFAULT_INVITE_CODE_REGENERATE_COOLDOWN_MS)
	})

	it('returns the default cooldown when the env var is zero or negative', () => {
		vi.stubEnv('INVITE_CODE_REGENERATE_COOLDOWN_MS', '-1000')
		expect(getInviteCodeRegenerateCooldownMs()).toBe(DEFAULT_INVITE_CODE_REGENERATE_COOLDOWN_MS)
	})

	it('uses the env var override when it is a valid positive number', () => {
		vi.stubEnv('INVITE_CODE_REGENERATE_COOLDOWN_MS', '60000')
		expect(getInviteCodeRegenerateCooldownMs()).toBe(60000)
	})
})

describe('isInviteCodeRegenerateOnCooldown', () => {
	afterEach(() => {
		vi.unstubAllEnvs()
	})

	it('returns false when the code has never been regenerated', () => {
		expect(isInviteCodeRegenerateOnCooldown(null)).toBe(false)
	})

	it('returns true when still inside the cooldown window', () => {
		vi.stubEnv('INVITE_CODE_REGENERATE_COOLDOWN_MS', '60000')
		const now = new Date('2026-01-01T00:01:00.000Z')
		const lastRegeneratedAt = new Date('2026-01-01T00:00:30.000Z')
		expect(isInviteCodeRegenerateOnCooldown(lastRegeneratedAt, now)).toBe(true)
	})

	it('returns false once the cooldown window has elapsed', () => {
		vi.stubEnv('INVITE_CODE_REGENERATE_COOLDOWN_MS', '60000')
		const now = new Date('2026-01-01T00:02:00.000Z')
		const lastRegeneratedAt = new Date('2026-01-01T00:00:00.000Z')
		expect(isInviteCodeRegenerateOnCooldown(lastRegeneratedAt, now)).toBe(false)
	})
})
