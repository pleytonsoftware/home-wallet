import { NextRequest, NextResponse } from 'next/server'

import { z } from 'zod'

import { withParamsValidation, withQueryValidation } from './param-validation'

function makeRequest(url = 'http://localhost/api/test') {
	return new NextRequest(url)
}

const request = makeRequest()
const schema = z.object({ id: z.string().min(1) })

describe('withParamsValidation', () => {
	it('calls next with the parsed params when valid', async () => {
		const next = vi.fn().mockReturnValue(NextResponse.json({ ok: true }))
		const middleware = withParamsValidation(schema)

		const response = await middleware(request, { params: Promise.resolve({ id: 'abc' }) }, next)

		expect(next).toHaveBeenCalledWith({ params: { id: 'abc' } })
		expect(await (response as NextResponse).json()).toEqual({ ok: true })
	})

	it('responds 400 and skips next when params fail validation', async () => {
		const next = vi.fn()
		const middleware = withParamsValidation(schema)

		const response = (await middleware(request, { params: Promise.resolve({ id: '' }) }, next)) as NextResponse

		expect(next).not.toHaveBeenCalled()
		expect(response.status).toBe(400)
		const body = await response.json()
		expect(body.error).toBe('Invalid path params')
		expect(body.issues).toBeDefined()
	})
})

describe('withQueryValidation', () => {
	it('calls next with the parsed query when valid', async () => {
		const next = vi.fn().mockReturnValue(NextResponse.json({ ok: true }))
		const middleware = withQueryValidation(schema)

		const response = await middleware(makeRequest('http://localhost/api/test?id=abc'), {}, next)

		expect(next).toHaveBeenCalledWith({ query: { id: 'abc' } })
		expect(await (response as NextResponse).json()).toEqual({ ok: true })
	})

	it('responds 400 and skips next when query fails validation', async () => {
		const next = vi.fn()
		const middleware = withQueryValidation(schema)

		const response = (await middleware(makeRequest('http://localhost/api/test?id='), {}, next)) as NextResponse

		expect(next).not.toHaveBeenCalled()
		expect(response.status).toBe(400)
		const body = await response.json()
		expect(body.error).toBe('Invalid query params')
		expect(body.issues).toBeDefined()
	})

	it('responds 400 when the query is missing entirely', async () => {
		const next = vi.fn()
		const middleware = withQueryValidation(schema)

		const response = (await middleware(makeRequest('http://localhost/api/test'), {}, next)) as NextResponse

		expect(next).not.toHaveBeenCalled()
		expect(response.status).toBe(400)
	})
})
