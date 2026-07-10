import type { FullErrorResult } from './types'

import { StatusCodes } from 'http-status-codes'

export function NOT_FOUND(message: string): FullErrorResult<string> {
	return { status: StatusCodes.NOT_FOUND, success: false, error: message }
}
