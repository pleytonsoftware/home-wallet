import { getActiveMembership } from '@actions/household/active-memberships'
import { authorizedSession } from '@lib/auth/utils'
import { prisma } from '@lib/prisma'

import { endRecurringSeries } from './end-recurring-series'

vi.mock('@lib/auth/utils', () => ({ authorizedSession: vi.fn() }))
vi.mock('@actions/household/active-memberships', () => ({ getActiveMembership: vi.fn() }))
vi.mock('@lib/prisma', () => ({
	prisma: {
		transaction: { findFirst: vi.fn(), updateMany: vi.fn() },
	},
}))

const SESSION = { user: { id: 'u1' } }

describe('endRecurringSeries', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		vi.mocked(authorizedSession).mockResolvedValue({ session: SESSION, error: null } as never)
	})

	it('returns forbidden when no transaction with that series id exists', async () => {
		vi.mocked(prisma.transaction.findFirst).mockResolvedValue(null)

		const result = await endRecurringSeries('series-1')

		expect(result.status).toBe(403)
		expect(prisma.transaction.updateMany).not.toHaveBeenCalled()
	})

	it('returns forbidden when the requester is not the owner', async () => {
		vi.mocked(prisma.transaction.findFirst).mockResolvedValue({ householdId: 'h1', householdMemberId: 'm2' } as never)
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: 'member' } as never)

		const result = await endRecurringSeries('series-1')

		expect(result.status).toBe(403)
		expect(prisma.transaction.updateMany).not.toHaveBeenCalled()
	})

	it('flips isRecurring off across every transaction in the series when the requester owns it', async () => {
		vi.mocked(prisma.transaction.findFirst).mockResolvedValue({ householdId: 'h1', householdMemberId: 'm1' } as never)
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: 'member' } as never)
		vi.mocked(prisma.transaction.updateMany).mockResolvedValue({ count: 3 } as never)

		const result = await endRecurringSeries('series-1')

		expect(result.status).toBe(200)
		expect(prisma.transaction.updateMany).toHaveBeenCalledWith({
			where: { householdMemberId: 'm1', recurrenceRule: { path: ['seriesId'], equals: 'series-1' } },
			data: { isRecurring: false },
		})
	})
})
