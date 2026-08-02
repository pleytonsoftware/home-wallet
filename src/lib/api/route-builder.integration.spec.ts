import type { logger } from '@lib/logger'

import { NextRequest, NextResponse } from 'next/server'

import { z } from 'zod'

import { authorizedSession } from '@lib/auth/utils'

import { withAuth, withErrorBoundary, withParamsValidation } from './middlewares'
import { createRoute } from './route-builder'

vi.mock('@lib/auth/utils', () => ({
	authorizedSession: vi.fn(),
}))

const request = new NextRequest('http://localhost/api/households/h1')
const paramsSchema = z.object({ id: z.string().min(1) })
const routeLogger = { error: vi.fn() } as unknown as typeof logger

function buildTestRoute() {
	return createRoute<{ params: Promise<{ id: string }> }>()
		.use(withErrorBoundary(routeLogger, 'route failed'))
		.use(withAuth)
		.use(withParamsValidation(paramsSchema))
		.handler(async (_request, { params, session }) => NextResponse.json({ id: params.id, userId: session.user.id }))
}

describe('createRoute + withErrorBoundary + withAuth + withParamsValidation', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('runs the handler with parsed params and the session when everything succeeds', async () => {
		vi.mocked(authorizedSession).mockResolvedValue({ session: { user: { id: 'u1' } }, error: null } as never)
		const route = buildTestRoute()

		const response = await route(request, { params: Promise.resolve({ id: 'h1' }) })

		expect(response.status).toBe(200)
		expect(await response.json()).toEqual({ id: 'h1', userId: 'u1' })
	})

	it('short-circuits with 401 before params are validated when unauthenticated', async () => {
		const error = { status: 401, success: false, error: 'Unauthorized' }
		vi.mocked(authorizedSession).mockResolvedValue({ session: null, error } as never)
		const route = buildTestRoute()

		const response = await route(request, { params: Promise.resolve({ id: 'h1' }) })

		expect(response.status).toBe(401)
	})

	it('responds 400 for invalid params without ever reaching the handler', async () => {
		vi.mocked(authorizedSession).mockResolvedValue({ session: { user: { id: 'u1' } }, error: null } as never)
		const route = buildTestRoute()

		const response = await route(request, { params: Promise.resolve({ id: '' }) })

		expect(response.status).toBe(400)
	})

	it('catches a downstream throw and logs via the error boundary', async () => {
		vi.mocked(authorizedSession).mockRejectedValue(new Error('db down'))
		const route = buildTestRoute()

		const response = await route(request, { params: Promise.resolve({ id: 'h1' }) })

		expect(response.status).toBe(500)
		expect(routeLogger.error).toHaveBeenCalledWith('route failed', { error: expect.any(Error) })
	})
})
