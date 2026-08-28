import { NextRequest } from 'next/server'

import { getActiveMembership } from '@actions/household/active-memberships'
import { authorizedSession } from '@lib/auth/utils'
import { prisma } from '@lib/prisma'

import { GET } from './route'

vi.mock('@lib/auth/utils', () => ({ authorizedSession: vi.fn() }))
vi.mock('@actions/household/active-memberships', () => ({ getActiveMembership: vi.fn() }))
vi.mock('@lib/prisma', () => ({
	prisma: {
		transaction: { findMany: vi.fn() },
	},
}))

const SESSION = { user: { id: 'u1' } }
const request = new NextRequest('http://localhost/api/households/h1/transactions?monthlyBudgetId=b1')

describe('GET /households/:id/transactions', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		vi.mocked(authorizedSession).mockResolvedValue({ session: SESSION, error: null } as never)
	})

	it('responds 401 when unauthenticated', async () => {
		const error = { status: 401, success: false, error: 'Unauthorized' }
		vi.mocked(authorizedSession).mockResolvedValue({ session: null, error } as never)

		const response = await GET(request, { params: Promise.resolve({ id: 'h1' }) })

		expect(response.status).toBe(401)
		expect(prisma.transaction.findMany).not.toHaveBeenCalled()
	})

	it('responds 400 when monthlyBudgetId is missing', async () => {
		const badRequest = new NextRequest('http://localhost/api/households/h1/transactions')

		const response = await GET(badRequest, { params: Promise.resolve({ id: 'h1' }) })

		expect(response.status).toBe(400)
		expect(prisma.transaction.findMany).not.toHaveBeenCalled()
	})

	it('responds 403 when the requester is not an active member of the household', async () => {
		vi.mocked(getActiveMembership).mockResolvedValue(null)

		const response = await GET(request, { params: Promise.resolve({ id: 'h1' }) })

		expect(response.status).toBe(403)
		expect(prisma.transaction.findMany).not.toHaveBeenCalled()
	})

	it('scopes the query to the requester and the given monthly budget', async () => {
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: 'member' } as never)
		vi.mocked(prisma.transaction.findMany).mockResolvedValue([])

		await GET(request, { params: Promise.resolve({ id: 'h1' }) })

		expect(prisma.transaction.findMany).toHaveBeenCalledWith(
			expect.objectContaining({
				where: { householdId: 'h1', householdMemberId: 'm1', monthlyBudgetId: 'b1' },
			}),
		)
	})

	it('maps transaction rows to TransactionSummary', async () => {
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: 'member' } as never)
		vi.mocked(prisma.transaction.findMany).mockResolvedValue([
			{
				id: 't1',
				monthlyBudgetId: 'b1',
				name: 'Groceries',
				amount: 42.5,
				type: 'expense',
				category: { id: 'c1', name: 'Food', color: 'green', icon: 'shopping-cart', isBase: false },
				sourceAccount: null,
				note: null,
				date: new Date('2026-08-15T00:00:00.000Z'),
				isRecurring: false,
				recurrenceRule: null,
				createdAt: new Date('2026-08-15T00:00:00.000Z'),
			},
		] as never)

		const response = await GET(request, { params: Promise.resolve({ id: 'h1' }) })
		const data = await response.json()

		expect(data).toEqual([
			{
				id: 't1',
				monthlyBudgetId: 'b1',
				name: 'Groceries',
				amount: 42.5,
				type: 'expense',
				category: { id: 'c1', name: 'Food', color: 'green', icon: 'shopping-cart', isBase: false },
				sourceAccount: null,
				note: null,
				date: '2026-08-15T00:00:00.000Z',
				isRecurring: false,
				recurrenceRule: null,
				createdAt: '2026-08-15T00:00:00.000Z',
			},
		])
	})
})
