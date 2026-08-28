import { withErrorBoundary } from './error-boundary'

const actionLogger = { error: vi.fn() } as unknown as Parameters<typeof withErrorBoundary>[0]

describe('withErrorBoundary', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('returns the downstream result untouched when next succeeds', async () => {
		const next = vi.fn().mockReturnValue({ ok: true })
		const middleware = withErrorBoundary(actionLogger, 'boom')

		const result = await middleware({}, next)

		expect(result).toEqual({ ok: true })
		expect(actionLogger.error).not.toHaveBeenCalled()
	})

	it('logs and returns INTERNAL_ERROR when next throws', async () => {
		const thrown = new Error('downstream failure')
		const next = vi.fn().mockRejectedValue(thrown)
		const middleware = withErrorBoundary(actionLogger, 'boom')

		const result = await middleware({}, next)

		expect(actionLogger.error).toHaveBeenCalledWith('boom', { error: thrown })
		expect(result).toMatchObject({ status: 500, success: false })
	})
})
