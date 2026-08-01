import ms from 'ms'

export const DEFAULT_INVITE_CODE_LENGTH = 6
/**
 * Generate a random invite code (5-6 chars, alphanumeric uppercase)
 */
export function generateInviteCode(length: number = DEFAULT_INVITE_CODE_LENGTH): string {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
	const randomValues = new Uint32Array(length)
	crypto.getRandomValues(randomValues)

	return Array.from(randomValues, (c) => chars[c % chars.length]).join('')
}

/**
 * Validate an invite code format
 */
export function isValidInviteCode(code: string, maxLength: number = DEFAULT_INVITE_CODE_LENGTH): boolean {
	const regex = new RegExp(`^[A-Z0-9]{5,${maxLength}}$`)
	return regex.test(code)
}

export const DEFAULT_INVITE_CODE_REGENERATE_COOLDOWN_MS = ms('30days')

/**
 * Cooldown between invite code regenerations, in milliseconds.
 * Configurable via `INVITE_CODE_REGENERATE_COOLDOWN_MS`, defaults to 30 days.
 */
export function getInviteCodeRegenerateCooldownMs(): number {
	const inviteCodeRegenerateCooldown = process.env.INVITE_CODE_REGENERATE_COOLDOWN_MS as ms.StringValue
	const envValue = inviteCodeRegenerateCooldown ? ms(inviteCodeRegenerateCooldown) : 0
	return Number.isFinite(envValue) && envValue > 0 ? envValue : DEFAULT_INVITE_CODE_REGENERATE_COOLDOWN_MS
}

/**
 * Whether an invite code regeneration is still within the cooldown window since it was last regenerated.
 */
export function isInviteCodeRegenerateOnCooldown(lastRegeneratedAt: Date | null, now: Date = new Date()): boolean {
	if (!lastRegeneratedAt) return false
	return now.getTime() - lastRegeneratedAt.getTime() < getInviteCodeRegenerateCooldownMs()
}
