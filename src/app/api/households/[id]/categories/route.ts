import { NextResponse } from 'next/server'

import { z } from 'zod'

import { withActiveMembership, withAuth, withErrorBoundary, withParamsValidation } from '@lib/api/middlewares'
import { createRoute } from '@lib/api/route-builder'
import { categoryLogger } from '@lib/logger'
import { prisma } from '@lib/prisma'

const paramsSchema = z.object({ id: z.string().min(1) })

export const GET = createRoute<{ params: Promise<{ id: string }> }>()
	.use(withErrorBoundary(categoryLogger, '[GET /households/:id/categories]: {error}'))
	.use(withAuth)
	.use(withParamsValidation(paramsSchema))
	.use(withActiveMembership)
	.handler(async (_request, { params: { id: householdId } }) => {
		const categories = await prisma.category.findMany({
			where: { OR: [{ householdId }, { isBase: true }] },
			orderBy: { name: 'asc' },
			select: { id: true, name: true, color: true, isBase: true },
		})

		return NextResponse.json(categories)
	})

export const dynamic = 'cache'
