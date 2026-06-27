import { ROUTES } from '@lib/constants/routes.const'

/**
 * Get the signin callback URL from search params or return default
 */
export function getCallbackUrl(searchParams: URLSearchParams): string {
	const callbackUrl = searchParams.get('callbackUrl')
	return callbackUrl && callbackUrl.startsWith(ROUTES.LANDING) ? callbackUrl : ROUTES.DASHBOARD
}
