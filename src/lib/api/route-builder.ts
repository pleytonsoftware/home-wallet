import type { NextRequest, NextResponse } from 'next/server'

export type RouteHandler<Ctx> = (request: NextRequest, context: Ctx) => Promise<NextResponse> | NextResponse

/**
 * A route middleware: receives the context accumulated so far and a `next` callback to continue
 * the chain, contributing only the *new* piece of context (`Out`) — the builder merges it in.
 * Returning a response directly (without calling `next`) short-circuits the rest of the chain.
 */
export type Middleware<In, Out> = (
	request: NextRequest,
	context: In,
	next: (out: Out) => Promise<NextResponse> | NextResponse,
) => Promise<NextResponse> | NextResponse

export interface RouteBuilder<Seed, Ctx> {
	use: <Out>(middleware: Middleware<Ctx, Out>) => RouteBuilder<Seed, Omit<Ctx, keyof Out> & Out>
	handler: (finalHandler: RouteHandler<Ctx>) => (request: NextRequest, context: Seed) => Promise<NextResponse>
}

function buildRoute<Seed, Ctx>(middlewares: ReadonlyArray<Middleware<never, unknown>>): RouteBuilder<Seed, Ctx> {
	return {
		use: (middleware) => buildRoute([...middlewares, middleware as Middleware<never, unknown>]),
		handler: (finalHandler) => async (request, context) => {
			const dispatch = (index: number, ctx: unknown): Promise<NextResponse> | NextResponse =>
				index === middlewares.length
					? finalHandler(request, ctx as Ctx)
					: middlewares[index](request, ctx as never, (out) => dispatch(index + 1, { ...(ctx as object), ...(out as object) }))

			return dispatch(0, context)
		},
	}
}

/**
 * Starts a fluent route-handler builder, e.g. `createRoute<{ params: Promise<{ id: string }> }>().use(withAuth).handler(fn)`.
 * The generic `Seed` type is the shape of the initial context passed to the first middleware.
 * Each middleware can contribute additional context, which is merged into the context passed to subsequent middlewares.
 * The final handler receives the accumulated context from all middlewares.
 */
export const createRoute = <Seed = unknown>(): RouteBuilder<Seed, Seed> => buildRoute<Seed, Seed>([])
