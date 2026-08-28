import type { ActionMiddleware } from '@lib/actions/action-builder'

import { FORBIDDEN } from '@lib/errors'

/**
 * Loads the resource being acted on (e.g. `loader: (ctx) => prisma.transaction.findUnique({ where: { id: ctx.transactionId }, select: {...} })`),
 * short-circuiting with `FORBIDDEN` when it doesn't exist. Forwards the whole loaded resource as `context.resource`
 * so handlers can reuse fields beyond `householdId`/`householdMemberId` (e.g. `recurrenceRule`). Compose before
 * `withActiveMembership(..., { requireOwner: ... })`, whose resolvers then read `context.resource`.
 */
export const withOwnedResource =
	<In, Resource extends { householdId: string; householdMemberId: string | null }>(
		loader: (context: In) => Promise<Resource | null>,
	): ActionMiddleware<In, { resource: Resource }> =>
	async (context, next) => {
		const resource = await loader(context)
		if (!resource) return FORBIDDEN()
		return next({ resource })
	}
