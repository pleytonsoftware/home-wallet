import type { FullErrorResult } from './types'

import { StatusCodes } from 'http-status-codes'

export const INTERNAL_ERROR = (error?: unknown) =>
	({
		status: StatusCodes.INTERNAL_SERVER_ERROR,
		success: false,
		error: error instanceof Error ? error.message : 'Internal server error',
	}) satisfies FullErrorResult
