import { auth } from '@lib/auth'
import { UNAUTHORIZED } from '@lib/errors/unauthorized'

/**
 * Validates the session and returns it or an error object.
 * The returned error object is compatible with ResponseResult.
 */
export async function authorizedSession() {
	const session = await auth()

	if (!session?.isAuthenticated) {
		return {
			session: null,
			error: UNAUTHORIZED,
		}
	}

	return { session, error: null }
}
