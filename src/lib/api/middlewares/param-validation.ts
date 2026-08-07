import type { Middleware } from '@lib/api/route-builder'

import { NextResponse } from 'next/server'

import { StatusCodes } from 'http-status-codes'
import { z } from 'zod'

/**
 * Validates `context.params` (the App Router's route params promise) against `schema`, replacing
 * it with the parsed, typed result before calling `next`. Responds with 400 on failure.
 * @param schema
 * @returns
 */
export const withParamsValidation =
	<P>(schema: z.ZodType<P>): Middleware<{ params: Promise<unknown> }, { params: P }> =>
	async (_request, context, next) => {
		const parsed = schema.safeParse(await context.params)

		if (!parsed.success) {
			return NextResponse.json(
				{ error: 'Invalid path params', issues: z.treeifyError(parsed.error).errors },
				{ status: StatusCodes.BAD_REQUEST },
			)
		}

		return next({ params: parsed.data })
	}

export const withQueryValidation =
	<Q>(schema: z.ZodType<Q>): Middleware<unknown, { query: Q }> =>
	async (request, _context, next) => {
		const parsed = schema.safeParse(Object.fromEntries(request.nextUrl.searchParams))

		if (!parsed.success) {
			return NextResponse.json(
				{ error: 'Invalid query params', issues: z.treeifyError(parsed.error).errors },
				{ status: StatusCodes.BAD_REQUEST },
			)
		}

		return next({ query: parsed.data })
	}
