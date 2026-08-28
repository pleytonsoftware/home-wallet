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
const request = new NextRequest('http://localhost/api/households/h1/transactions/recurring')

const RECURRING_ROW = {
	id: 't1',
	name: 'Rent',
	amount: 1200,
	type: 'expense',
	category: null,
	sourceAccount: null,
	note: null,
	date: new Date('2026-07-15T00:00:00.000Z'),
	isRecurring: true,
	recurrenceRule: { frequency: 'monthly', seriesId: 's1', occurrenceCount: 1 },
}

describe('GET /households/:id/transactions/recurring', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		vi.useFakeTimers().setSystemTime(new Date('2026-08-01T00:00:00.000Z'))
		vi.mocked(authorizedSession).mockResolvedValue({ session: SESSION, error: null } as never)
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	it('responds 403 when the requester is not an active member of the household', async () => {
		vi.mocked(getActiveMembership).mockResolvedValue(null)

		const response = await GET(request, { params: Promise.resolve({ id: 'h1' }) })

		expect(response.status).toBe(403)
		expect(prisma.transaction.findMany).not.toHaveBeenCalled()
	})

	it('returns an active series with its next-due date', async () => {
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: 'member' } as never)
		vi.mocked(prisma.transaction.findMany).mockResolvedValue([RECURRING_ROW] as never)

		const response = await GET(request, { params: Promise.resolve({ id: 'h1' }) })
		const data = await response.json()

		expect(data).toEqual([
			expect.objectContaining({
				seriesId: 's1',
				anchorTransactionId: 't1',
				status: 'active',
				nextOccurrenceDate: '2026-08-15T00:00:00.000Z',
			}),
		])
	})

	it('marks a series ended when its anchor is no longer recurring', async () => {
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: 'member' } as never)
		vi.mocked(prisma.transaction.findMany).mockResolvedValue([{ ...RECURRING_ROW, isRecurring: false }] as never)

		const response = await GET(request, { params: Promise.resolve({ id: 'h1' }) })
		const data = await response.json()

		expect(data).toEqual([expect.objectContaining({ status: 'ended', nextOccurrenceDate: null })])
	})

	it('marks a series ended once its occurrences cap has been reached, even while isRecurring is still true', async () => {
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: 'member' } as never)
		vi.mocked(prisma.transaction.findMany).mockResolvedValue([
			{
				...RECURRING_ROW,
				recurrenceRule: { frequency: 'monthly', seriesId: 's1', occurrences: 1, occurrenceCount: 1 },
			},
		] as never)

		const response = await GET(request, { params: Promise.resolve({ id: 'h1' }) })
		const data = await response.json()

		expect(data).toEqual([expect.objectContaining({ status: 'ended', nextOccurrenceDate: null })])
	})

	it('only returns one row per series, using the latest transaction as the anchor', async () => {
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: 'member' } as never)
		vi.mocked(prisma.transaction.findMany).mockResolvedValue([
			RECURRING_ROW,
			{
				...RECURRING_ROW,
				id: 't2',
				date: new Date('2026-07-01T00:00:00.000Z'),
				recurrenceRule: { ...RECURRING_ROW.recurrenceRule, occurrenceCount: 1 },
			},
		] as never)

		const response = await GET(request, { params: Promise.resolve({ id: 'h1' }) })
		const data = await response.json()

		expect(data).toHaveLength(1)
		expect(data[0].anchorTransactionId).toBe('t1')
	})

	it('ignores rows without a seriesId', async () => {
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: 'member' } as never)
		vi.mocked(prisma.transaction.findMany).mockResolvedValue([{ ...RECURRING_ROW, recurrenceRule: { frequency: 'monthly' } }] as never)

		const response = await GET(request, { params: Promise.resolve({ id: 'h1' }) })
		const data = await response.json()

		expect(data).toEqual([])
	})
})
