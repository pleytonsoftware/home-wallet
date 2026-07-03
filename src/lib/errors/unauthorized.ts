import type { FullErrorResult } from './types'

import { StatusCodes } from 'http-status-codes'

export const UNAUTHORIZED = { status: StatusCodes.UNAUTHORIZED, success: false, error: 'Unauthorized' } satisfies FullErrorResult
