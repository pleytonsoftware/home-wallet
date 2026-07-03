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
