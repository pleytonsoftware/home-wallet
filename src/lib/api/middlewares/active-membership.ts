import type { Middleware } from '@lib/api/route-builder'
import type { AuthorizedSession } from './authentication'

import { NextResponse } from 'next/server'

import { getActiveMembership } from '@actions/household/active-memberships'
import { FORBIDDEN } from '@lib/errors'

export type ActiveMembership = NonNullable<Awaited<ReturnType<typeof getActiveMembership>>>

/**
 * Resolves the requester's active membership in the household identified by `params.id`,
 * responding with 403 when they aren't (or are no longer) a member.
 */
export const withActiveMembership: Middleware<{ params: { id: string }; session: AuthorizedSession }, { membership: ActiveMembership }> = async (
	_request,
	{ params: { id: householdId }, session },
	next,
) => {
	const membership = await getActiveMembership({ userId: session.user.id, householdId })

	if (!membership) {
		const { status, error } = FORBIDDEN()
		return NextResponse.json({ error }, { status })
	}

	return next({ membership })
}
