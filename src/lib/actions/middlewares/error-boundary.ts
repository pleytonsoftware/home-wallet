import type { ActionMiddleware } from '@lib/actions/action-builder'
import type { logger } from '@lib/logger'

import { INTERNAL_ERROR } from '@lib/errors'

/** Wraps the rest of the chain in a try/catch, logging via `actionLogger` and returning `INTERNAL_ERROR` on failure. */
export const withErrorBoundary =
	(actionLogger: typeof logger, message: string): ActionMiddleware<unknown, unknown> =>
	async (_context, next) => {
		try {
			return await next({})
		} catch (error) {
			actionLogger.error(message, { error })
			return INTERNAL_ERROR(error)
		}
	}
