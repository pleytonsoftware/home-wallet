import type { NextApiRequest, NextApiResponse } from 'next'

import { NextResponse } from 'next/server'

import { StatusCodes } from 'http-status-codes'
import { z } from 'zod'

export type NextApiRequestWithValidatedData<Q> = NextApiRequest & { validatedData: Q }
export type Handler<Q> = (req: NextApiRequestWithValidatedData<Q>, res: NextApiResponse) => NextResponse | Promise<NextResponse>

// TODO: make one function to reuse from the schema.safeParse, but differes in where the data comes from (query, params, etc...)
export function withQueryValidation<Q>(schema: z.ZodSchema<Q>, handler: Handler<Q>) {
	return async (req: NextApiRequestWithValidatedData<Q>, res: NextApiResponse) => {
		const result = schema.safeParse(req.query)

		if (!result.success) {
			return NextResponse.json(
				{
					error: 'Invalid query params',
					issues: z.treeifyError(result.error).errors,
				},
				{ status: StatusCodes.BAD_REQUEST },
			)
		}

		req.validatedData = result.data
		return handler(req, res)
	}
}

export function withParamsValidation<P>(schema: z.ZodSchema<P>, handler: Handler<P>) {
	return async (req: NextApiRequestWithValidatedData<P>, context: { params: Promise<Record<string, string>> }, res: NextApiResponse) => {
		const rawParams = await context.params
		const result = schema.safeParse(rawParams)

		if (!result.success) {
			return NextResponse.json(
				{ error: 'Invalid path params', issues: z.treeifyError(result.error).errors },
				{ status: StatusCodes.BAD_REQUEST },
			)
		}

		req.validatedData = result.data
		return handler(req, res)
	}
}
