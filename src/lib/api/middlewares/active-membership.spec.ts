import { NextRequest, NextResponse } from 'next/server'

import { getActiveMembership } from '@actions/household/active-memberships'

import { withActiveMembership } from './active-membership'

vi.mock('@actions/household/active-memberships', () => ({ getActiveMembership: vi.fn() }))

const request = new NextRequest('http://localhost/api/test')
const session = { user: { id: 'u1' } }

describe('withActiveMembership', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('calls next with the membership when the requester is an active member', async () => {
		const membership = { id: 'm1', role: 'member' }
		vi.mocked(getActiveMembership).mockResolvedValue(membership as never)
		const next = vi.fn().mockReturnValue(NextResponse.json({ ok: true }))

		const response = await withActiveMembership(request, { params: { id: 'h1' }, session } as never, next)

		expect(getActiveMembership).toHaveBeenCalledWith({ userId: 'u1', householdId: 'h1' })
		expect(next).toHaveBeenCalledWith({ membership })
		expect(await (response as NextResponse).json()).toEqual({ ok: true })
	})

	it('responds 403 and skips next when the requester is not an active member', async () => {
		vi.mocked(getActiveMembership).mockResolvedValue(null)
		const next = vi.fn()

		const response = (await withActiveMembership(request, { params: { id: 'h1' }, session } as never, next)) as NextResponse

		expect(next).not.toHaveBeenCalled()
		expect(response.status).toBe(403)
		const body = await response.json()
		expect(body.error).toBe('Forbidden')
	})
})
