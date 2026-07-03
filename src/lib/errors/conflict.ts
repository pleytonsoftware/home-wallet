import type { FullErrorResult } from './types'

import { StatusCodes } from 'http-status-codes'

export const CONFLICT = (error?: unknown) =>
	({
		status: StatusCodes.CONFLICT,
		success: false,
		error: error instanceof Error ? error.message : 'Conflict',
	}) satisfies FullErrorResult
