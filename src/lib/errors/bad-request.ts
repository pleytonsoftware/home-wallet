import type { $ZodIssue } from 'zod/v4/core'
import type { FullErrorResult } from './types'

import { StatusCodes } from 'http-status-codes'

export const BAD_REQUEST = (issues: $ZodIssue[]) =>
	({ status: StatusCodes.BAD_REQUEST, success: false, error: issues }) satisfies FullErrorResult<$ZodIssue[]>
