import type { Middleware } from '@lib/api/route-builder'

import { NextResponse } from 'next/server'

import { authorizedSession } from '@lib/auth/utils'

export type AuthorizedSession = NonNullable<Awaited<ReturnType<typeof authorizedSession>>['session']>

export const withAuth: Middleware<unknown, { session: AuthorizedSession }> = async (_request, _context, next) => {
	const { session, error } = await authorizedSession()

	if (error) {
		return NextResponse.json({ error }, { status: error.status })
	}

	return next({ session })
}
