import type { ActionMiddleware } from './action-builder'

import { createAction } from './action-builder'

describe('createAction', () => {
	it('calls the handler with the seed context when no middleware is used', async () => {
		const handler = vi.fn().mockReturnValue({ ok: true })
		const action = createAction<{ id: string }>().handler(handler)

		await action({ id: '1' })

		expect(handler).toHaveBeenCalledWith({ id: '1' })
	})

	it('merges each middleware’s contributed context into what the next one receives', async () => {
		const addA: ActionMiddleware<unknown, { a: number }> = (_ctx, next) => next({ a: 1 })
		const addB: ActionMiddleware<{ a: number }, { b: number }> = (ctx, next) => next({ b: ctx.a + 1 })

		const handler = vi.fn().mockReturnValue({ ok: true })
		const action = createAction().use(addA).use(addB).handler(handler)

		await action({})

		expect(handler).toHaveBeenCalledWith({ a: 1, b: 2 })
	})

	it('runs middleware in the order they were added', async () => {
		const order: string[] = []
		const first: ActionMiddleware<unknown, unknown> = (_ctx, next) => {
			order.push('first')
			return next({})
		}
		const second: ActionMiddleware<unknown, unknown> = (_ctx, next) => {
			order.push('second')
			return next({})
		}

		const action = createAction()
			.use(first)
			.use(second)
			.handler(() => {
				order.push('handler')
				return { ok: true }
			})

		await action({})

		expect(order).toEqual(['first', 'second', 'handler'])
	})

	it('later context keys override earlier ones with the same name', async () => {
		const setParams: ActionMiddleware<unknown, { params: string }> = (_ctx, next) => next({ params: 'raw' })
		const parseParams: ActionMiddleware<{ params: string }, { params: number }> = (_ctx, next) => next({ params: 42 })

		const handler = vi.fn().mockReturnValue({ ok: true })
		const action = createAction().use(setParams).use(parseParams).handler(handler)

		await action({})

		expect(handler).toHaveBeenCalledWith({ params: 42 })
	})

	it('short-circuits the chain when a middleware returns a result without calling next', async () => {
		const blocker: ActionMiddleware<unknown, { a: number }> = () => ({ status: 403, success: false, error: 'Forbidden' })
		const handler = vi.fn()

		const action = createAction().use(blocker).handler(handler)

		const result = await action({})

		expect(handler).not.toHaveBeenCalled()
		expect(result).toEqual({ status: 403, success: false, error: 'Forbidden' })
	})
})
