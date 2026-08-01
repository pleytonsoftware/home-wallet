import type { FullErrorResult } from './types'

import { StatusCodes } from 'http-status-codes'

export const FORBIDDEN = (message = 'Forbidden') => ({ status: StatusCodes.FORBIDDEN, success: false, error: message }) satisfies FullErrorResult
