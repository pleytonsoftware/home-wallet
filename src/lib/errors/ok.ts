import type { FullSuccessResult } from './types'

import { StatusCodes } from 'http-status-codes'

export const OK = <T extends unknown | undefined = unknown>(data: T) =>
	({
		status: StatusCodes.OK,
		success: true,
		data,
	}) satisfies FullSuccessResult<T>
