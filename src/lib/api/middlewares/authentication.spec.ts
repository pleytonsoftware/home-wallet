import { NextRequest, NextResponse } from 'next/server'

import { authorizedSession } from '@lib/auth/utils'

import { withAuth } from './authentication'

vi.mock('@lib/auth/utils', () => ({
	authorizedSession: vi.fn(),
}))

const request = new NextRequest('http://localhost/api/test')

describe('withAuth', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('calls next with the session when authorized', async () => {
		const session = { user: { id: 'u1' } }
		vi.mocked(authorizedSession).mockResolvedValue({ session, error: null } as never)
		const next = vi.fn().mockReturnValue(NextResponse.json({ ok: true }))

		const response = await withAuth(request, {}, next)

		expect(next).toHaveBeenCalledWith({ session })
		expect(await (response as NextResponse).json()).toEqual({ ok: true })
	})

	it('responds with the unauthorized error and skips next when unauthenticated', async () => {
		const error = { status: 401, success: false, error: 'Unauthorized' }
		vi.mocked(authorizedSession).mockResolvedValue({ session: null, error } as never)
		const next = vi.fn()

		const response = (await withAuth(request, {}, next)) as NextResponse

		expect(next).not.toHaveBeenCalled()
		expect(response.status).toBe(401)
		expect(await response.json()).toEqual({ error })
	})
})
