import { NextRequest } from 'next/server'

import { getActiveMembership } from '@actions/household/active-memberships'
import { authorizedSession } from '@lib/auth/utils'
import { prisma } from '@lib/prisma'

import { GET } from './route'

vi.mock('@lib/auth/utils', () => ({ authorizedSession: vi.fn() }))
vi.mock('@actions/household/active-memberships', () => ({ getActiveMembership: vi.fn() }))
vi.mock('@lib/prisma', () => ({
	prisma: {
		bankAccount: { findMany: vi.fn() },
	},
}))

const SESSION = { user: { id: 'u1' } }
const request = new NextRequest('http://localhost/api/households/h1/bank-accounts')

describe('GET /households/:id/bank-accounts', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		vi.mocked(authorizedSession).mockResolvedValue({ session: SESSION, error: null } as never)
	})

	it('responds 401 when unauthenticated', async () => {
		const error = { status: 401, success: false, error: 'Unauthorized' }
		vi.mocked(authorizedSession).mockResolvedValue({ session: null, error } as never)

		const response = await GET(request, { params: Promise.resolve({ id: 'h1' }) })

		expect(response.status).toBe(401)
		expect(prisma.bankAccount.findMany).not.toHaveBeenCalled()
	})

	it('responds 403 when the requester is not an active member of the household', async () => {
		vi.mocked(getActiveMembership).mockResolvedValue(null)

		const response = await GET(request, { params: Promise.resolve({ id: 'h1' }) })

		expect(response.status).toBe(403)
		expect(prisma.bankAccount.findMany).not.toHaveBeenCalled()
	})

	it('scopes the query to accounts the requester owns or is shared on', async () => {
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: 'member' } as never)
		vi.mocked(prisma.bankAccount.findMany).mockResolvedValue([])

		await GET(request, { params: Promise.resolve({ id: 'h1' }) })

		expect(prisma.bankAccount.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { householdId: 'h1', OR: [{ householdMemberId: 'm1' }, { sharedWith: { some: { householdMemberId: 'm1' } } }] },
			}),
		)
	})

	it('marks isOwner based on the requester membership id and maps shared members', async () => {
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: 'member' } as never)
		vi.mocked(prisma.bankAccount.findMany).mockResolvedValue([
			{
				id: 'a1',
				householdId: 'h1',
				name: 'Joint',
				type: 'bank',
				lastFourDigits: '1234',
				householdMemberId: 'm2',
				householdMember: { id: 'm2', user: { id: 'u2', name: 'Bob', image: null } },
				sharedWith: [{ householdMember: { id: 'm1', user: { id: 'u1', name: 'Alice', image: null } } }],
				createdAt: new Date('2026-01-01T00:00:00.000Z'),
			},
		] as never)

		const response = await GET(request, { params: Promise.resolve({ id: 'h1' }) })
		const data = await response.json()

		expect(data).toEqual([
			{
				id: 'a1',
				householdId: 'h1',
				name: 'Joint',
				type: 'bank',
				lastFourDigits: '1234',
				isOwner: false,
				owner: { id: 'm2', name: 'Bob', image: null },
				sharedWith: [{ id: 'm1', name: 'Alice', image: null }],
				createdAt: '2026-01-01T00:00:00.000Z',
			},
		])
	})
})
