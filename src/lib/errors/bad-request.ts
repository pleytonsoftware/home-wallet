import type { $ZodIssue } from 'zod/v4/core'
import type { FullErrorResult } from './types'

import { StatusCodes } from 'http-status-codes'

export function BAD_REQUEST(issues: $ZodIssue[]): FullErrorResult<$ZodIssue[]>
export function BAD_REQUEST(message: string): FullErrorResult<string>
export function BAD_REQUEST(data: $ZodIssue[] | string) {
	return { status: StatusCodes.BAD_REQUEST, success: false, error: data }
}
