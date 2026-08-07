import { NextRequest } from 'next/server'

import { getActiveMembership } from '@actions/household/active-memberships'
import { authorizedSession } from '@lib/auth/utils'
import { prisma } from '@lib/prisma'

import { GET } from './route'

vi.mock('@lib/auth/utils', () => ({ authorizedSession: vi.fn() }))
vi.mock('@actions/household/active-memberships', () => ({ getActiveMembership: vi.fn() }))
vi.mock('@lib/prisma', () => ({
	prisma: {
		category: { findMany: vi.fn() },
	},
}))

const SESSION = { user: { id: 'u1' } }
const request = new NextRequest('http://localhost/api/households/h1/categories')

describe('GET /households/:id/categories', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		vi.mocked(authorizedSession).mockResolvedValue({ session: SESSION, error: null } as never)
	})

	it('responds 401 when unauthenticated', async () => {
		const error = { status: 401, success: false, error: 'Unauthorized' }
		vi.mocked(authorizedSession).mockResolvedValue({ session: null, error } as never)

		const response = await GET(request, { params: Promise.resolve({ id: 'h1' }) })

		expect(response.status).toBe(401)
		expect(prisma.category.findMany).not.toHaveBeenCalled()
	})

	it('responds 403 when the requester is not an active member of the household', async () => {
		vi.mocked(getActiveMembership).mockResolvedValue(null)

		const response = await GET(request, { params: Promise.resolve({ id: 'h1' }) })

		expect(response.status).toBe(403)
		expect(prisma.category.findMany).not.toHaveBeenCalled()
	})

	it('scopes the query to household-owned categories or global base categories', async () => {
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: 'member' } as never)
		vi.mocked(prisma.category.findMany).mockResolvedValue([])

		await GET(request, { params: Promise.resolve({ id: 'h1' }) })

		expect(prisma.category.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { OR: [{ householdId: 'h1' }, { isBase: true }] },
			}),
		)
	})

	it('maps category rows to CategorySummary', async () => {
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: 'member' } as never)
		vi.mocked(prisma.category.findMany).mockResolvedValue([
			{ id: 'c1', name: 'Groceries', color: 'green', isBase: true },
			{ id: 'c2', name: 'Side hustle', color: 'blue', isBase: false },
		] as never)

		const response = await GET(request, { params: Promise.resolve({ id: 'h1' }) })
		const data = await response.json()

		expect(data).toEqual([
			{ id: 'c1', name: 'Groceries', color: 'green', isBase: true },
			{ id: 'c2', name: 'Side hustle', color: 'blue', isBase: false },
		])
	})
})
