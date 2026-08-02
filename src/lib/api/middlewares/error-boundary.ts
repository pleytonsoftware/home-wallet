import type { Middleware } from '@lib/api/route-builder'
import type { logger } from '@lib/logger'

import { NextResponse } from 'next/server'

import { StatusCodes } from 'http-status-codes'

/**
 * Wraps the rest of the chain in a try/catch, logging via `routeLogger` and responding with 500 on failure.
 * @param routeLogger
 * @param message
 * @returns
 */
export const withErrorBoundary =
	(routeLogger: typeof logger, message: string): Middleware<unknown, unknown> =>
	async (_request, _context, next) => {
		try {
			return await next({})
		} catch (error) {
			routeLogger.error(message, { error })
			return NextResponse.json({ error: 'Internal server error' }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
		}
	}
