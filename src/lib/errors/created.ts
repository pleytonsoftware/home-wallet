import type { FullSuccessResult } from './types'

import { StatusCodes } from 'http-status-codes'

export const CREATED = <T = unknown>(data: T) =>
	({
		status: StatusCodes.CREATED,
		success: true,
		data,
	}) satisfies FullSuccessResult<T>
