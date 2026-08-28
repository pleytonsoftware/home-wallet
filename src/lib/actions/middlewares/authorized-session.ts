import type { ActionMiddleware } from '@lib/actions/action-builder'

import { authorizedSession } from '@lib/auth/utils'

export type AuthorizedActionSession = NonNullable<Awaited<ReturnType<typeof authorizedSession>>['session']>

/** Resolves the caller's session, short-circuiting with `UNAUTHORIZED` when there isn't one. */
export const withAuthorizedSession: ActionMiddleware<unknown, { session: AuthorizedActionSession }> = async (_context, next) => {
	const { session, error } = await authorizedSession()
	if (error) return error
	return next({ session })
}
