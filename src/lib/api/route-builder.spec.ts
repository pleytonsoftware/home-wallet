import type { Middleware } from './route-builder'

import { NextRequest, NextResponse } from 'next/server'

import { createRoute } from './route-builder'

const request = new NextRequest('http://localhost/api/test')

describe('createRoute', () => {
	it('calls the handler with the seed context when no middleware is used', async () => {
		const handler = vi.fn().mockReturnValue(NextResponse.json({ ok: true }))
		const route = createRoute<{ id: string }>().handler(handler)

		await route(request, { id: '1' })

		expect(handler).toHaveBeenCalledWith(request, { id: '1' })
	})

	it('merges each middleware’s contributed context into what the next one receives', async () => {
		const addA: Middleware<unknown, { a: number }> = (_req, _ctx, next) => next({ a: 1 })
		const addB: Middleware<{ a: number }, { b: number }> = (_req, ctx, next) => next({ b: ctx.a + 1 })

		const handler = vi.fn().mockReturnValue(NextResponse.json({ ok: true }))
		const route = createRoute().use(addA).use(addB).handler(handler)

		await route(request, {})

		expect(handler).toHaveBeenCalledWith(request, { a: 1, b: 2 })
	})

	it('runs middleware in the order they were added', async () => {
		const order: string[] = []
		const first: Middleware<unknown, unknown> = (_req, _ctx, next) => {
			order.push('first')
			return next({})
		}
		const second: Middleware<unknown, unknown> = (_req, _ctx, next) => {
			order.push('second')
			return next({})
		}

		const route = createRoute()
			.use(first)
			.use(second)
			.handler(() => {
				order.push('handler')
				return NextResponse.json({ ok: true })
			})

		await route(request, {})

		expect(order).toEqual(['first', 'second', 'handler'])
	})

	it('later context keys override earlier ones with the same name', async () => {
		const setParams: Middleware<unknown, { params: string }> = (_req, _ctx, next) => next({ params: 'raw' })
		const parseParams: Middleware<{ params: string }, { params: number }> = (_req, _ctx, next) => next({ params: 42 })

		const handler = vi.fn().mockReturnValue(NextResponse.json({ ok: true }))
		const route = createRoute().use(setParams).use(parseParams).handler(handler)

		await route(request, {})

		expect(handler).toHaveBeenCalledWith(request, { params: 42 })
	})

	it('short-circuits the chain when a middleware returns a response without calling next', async () => {
		const blocker: Middleware<unknown, { a: number }> = () => NextResponse.json({ blocked: true }, { status: 403 })
		const handler = vi.fn()

		const route = createRoute().use(blocker).handler(handler)

		const response = await route(request, {})

		expect(handler).not.toHaveBeenCalled()
		expect(response.status).toBe(403)
		expect(await response.json()).toEqual({ blocked: true })
	})
})
