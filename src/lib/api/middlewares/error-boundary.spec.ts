import { NextRequest, NextResponse } from 'next/server'

import { withErrorBoundary } from './error-boundary'

const request = new NextRequest('http://localhost/api/test')
const routeLogger = { error: vi.fn() } as unknown as Parameters<typeof withErrorBoundary>[0]

describe('withErrorBoundary', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('returns the downstream response untouched when next succeeds', async () => {
		const next = vi.fn().mockReturnValue(NextResponse.json({ ok: true }))
		const middleware = withErrorBoundary(routeLogger, 'boom')

		const response = await middleware(request, {}, next)

		expect(await (response as NextResponse).json()).toEqual({ ok: true })
		expect(routeLogger.error).not.toHaveBeenCalled()
	})

	it('logs and responds 500 when next throws', async () => {
		const thrown = new Error('downstream failure')
		const next = vi.fn().mockRejectedValue(thrown)
		const middleware = withErrorBoundary(routeLogger, 'boom')

		const response = (await middleware(request, {}, next)) as NextResponse

		expect(routeLogger.error).toHaveBeenCalledWith('boom', { error: thrown })
		expect(response.status).toBe(500)
		expect(await response.json()).toEqual({ error: 'Internal server error' })
	})
})
