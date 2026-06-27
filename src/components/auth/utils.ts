/**
 * Pure utility functions for authentication features
 */

import { ROUTES } from '@lib/constants/routes.const'

/**
 * Generate a random invite code (5-6 chars, alphanumeric uppercase)
 */
export function generateInviteCode(length: number = 6): string {
	const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
	const randomValues = new Uint32Array(length)
	crypto.getRandomValues(randomValues)

	return Array.from(randomValues, (c) => chars[c % chars.length]).join('')
}

/**
 * Validate an invite code format
 */
export function isValidInviteCode(code: string): boolean {
	return /^[A-Z0-9]{5,6}$/.test(code)
}

/**
 * Get the signin callback URL from search params or return default
 */
export function getCallbackUrl(searchParams: URLSearchParams): string {
	const callbackUrl = searchParams.get('callbackUrl')
	return callbackUrl && callbackUrl.startsWith(ROUTES.LANDING) ? callbackUrl : ROUTES.DASHBOARD
}
