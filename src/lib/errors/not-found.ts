import type { FullErrorResult } from './types'

import { StatusCodes } from 'http-status-codes'

export const NOT_FOUND = { status: StatusCodes.NOT_FOUND, success: false, error: 'not-found' } satisfies FullErrorResult
