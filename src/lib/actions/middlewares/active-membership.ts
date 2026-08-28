import type { ActionMiddleware } from '@lib/actions/action-builder'
import type { AuthorizedActionSession } from './authorized-session'

import { getActiveMembership } from '@actions/household/active-memberships'
import { MemberRole } from '@lib/constants/role.enum'
import { FORBIDDEN } from '@lib/errors'

export type ActiveMembership = NonNullable<Awaited<ReturnType<typeof getActiveMembership>>>

export interface ActiveMembershipOptions<In> {
	/** Requires the membership's role to be `ADMIN`. */
	requireAdmin?: boolean
	/** Requires `membership.id` to equal the id returned here (e.g. the owning member of an already-loaded resource). */
	requireOwner?: (context: In) => string | null
}

/**
 * Resolves the requester's active membership in the household returned by `getHouseholdId`, short-circuiting
 * with `FORBIDDEN` when they aren't (or are no longer) a member — or, per `options`, aren't an admin, or don't
 * own the resource being acted on. Covers all three action shapes uniformly:
 *   - direct household param:      `withActiveMembership((ctx) => ctx.householdId)`
 *   - admin-only:                  `withActiveMembership((ctx) => ctx.householdId, { requireAdmin: true })`
 *   - resource ownership (after `withOwnedResource`):
 *                                  `withActiveMembership((ctx) => ctx.resource.householdId, { requireOwner: (ctx) => ctx.resource.householdMemberId })`
 */
export const withActiveMembership =
	<In extends { session: AuthorizedActionSession }>(
		getHouseholdId: (context: In) => string,
		options: ActiveMembershipOptions<In> = {},
	): ActionMiddleware<In, { membership: ActiveMembership }> =>
	async (context, next) => {
		const membership = await getActiveMembership({ userId: context.session.user.id, householdId: getHouseholdId(context) })
		if (!membership) return FORBIDDEN()
		if (options.requireAdmin && membership.role !== MemberRole.ADMIN) return FORBIDDEN()
		if (options.requireOwner && membership.id !== options.requireOwner(context)) return FORBIDDEN()
		return next({ membership })
	}
