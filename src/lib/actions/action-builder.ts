import type { FullErrorResult } from '@lib/errors/types'

/**
 * An action middleware: receives the context accumulated so far and a `next` callback to continue
 * the chain, contributing only the *new* piece of context (`Out`) — the builder merges it in.
 * Returning a `FullErrorResult` directly (without calling `next`) short-circuits the rest of the chain.
 * Mirrors `Middleware<In, Out>` in `@lib/api/route-builder`, minus the `NextRequest`/`NextResponse`
 * plumbing actions don't have.
 */
export type ActionMiddleware<In, Out> = (context: In, next: (out: Out) => Promise<unknown> | unknown) => Promise<unknown> | unknown

export interface ActionBuilder<Seed, Ctx> {
	use: <Out>(middleware: ActionMiddleware<Ctx, Out>) => ActionBuilder<Seed, Omit<Ctx, keyof Out> & Out>
	handler: <Result>(finalHandler: (context: Ctx) => Promise<Result> | Result) => (context: Seed) => Promise<Result | FullErrorResult>
}

function buildAction<Seed, Ctx>(middlewares: ReadonlyArray<ActionMiddleware<never, unknown>>): ActionBuilder<Seed, Ctx> {
	return {
		use: (middleware) => buildAction([...middlewares, middleware as ActionMiddleware<never, unknown>]),
		handler: (finalHandler) => async (context) => {
			const dispatch = (index: number, ctx: unknown): Promise<unknown> | unknown =>
				index === middlewares.length
					? finalHandler(ctx as never)
					: middlewares[index](ctx as never, (out) => dispatch(index + 1, { ...(ctx as object), ...(out as object) }))

			return dispatch(0, context) as never
		},
	}
}

/**
 * Starts a fluent server-action builder, e.g.
 * `createAction<{ householdId: string; input: X }>().use(withErrorBoundary(logger, msg)).use(withAuthorizedSession).handler(fn)`.
 * The generic `Seed` type is the shape of the initial context (built by the exported action's thin
 * positional-args wrapper). Each middleware contributes additional context, merged into what the next
 * middleware/handler receives. Short-circuiting is done by a middleware returning a `FullErrorResult`
 * instead of calling `next`.
 */
export const createAction = <Seed = unknown>(): ActionBuilder<Seed, Seed> => buildAction<Seed, Seed>([])
