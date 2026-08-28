import { getActiveMembership } from '@actions/household/active-memberships'
import { authorizedSession } from '@lib/auth/utils'
import { prisma } from '@lib/prisma'

import { deleteTransaction } from './delete'

vi.mock('@lib/auth/utils', () => ({ authorizedSession: vi.fn() }))
vi.mock('@actions/household/active-memberships', () => ({ getActiveMembership: vi.fn() }))
vi.mock('@lib/prisma', () => {
	const prisma = {
		transaction: { findUnique: vi.fn(), delete: vi.fn(), updateMany: vi.fn() },
		$transaction: vi.fn((cb: (tx: typeof prisma) => unknown) => cb(prisma)),
	}
	return { prisma }
})

const SESSION = { user: { id: 'u1' } }

describe('deleteTransaction', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		vi.mocked(authorizedSession).mockResolvedValue({ session: SESSION, error: null } as never)
	})

	it('returns forbidden when the transaction does not exist', async () => {
		vi.mocked(prisma.transaction.findUnique).mockResolvedValue(null)

		const result = await deleteTransaction('t1')

		expect(result.status).toBe(403)
		expect(prisma.transaction.delete).not.toHaveBeenCalled()
	})

	it('returns forbidden when the requester is not the owner', async () => {
		vi.mocked(prisma.transaction.findUnique).mockResolvedValue({ householdId: 'h1', householdMemberId: 'm2' } as never)
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: 'member' } as never)

		const result = await deleteTransaction('t1')

		expect(result.status).toBe(403)
		expect(prisma.transaction.delete).not.toHaveBeenCalled()
	})

	it('deletes the transaction when the requester is the owner', async () => {
		vi.mocked(prisma.transaction.findUnique).mockResolvedValue({ householdId: 'h1', householdMemberId: 'm1' } as never)
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: 'member' } as never)
		vi.mocked(prisma.transaction.delete).mockResolvedValue({ id: 't1' } as never)

		const result = await deleteTransaction('t1')

		expect(result.status).toBe(200)
		expect(prisma.transaction.delete).toHaveBeenCalledWith({ where: { id: 't1' } })
	})

	it('does not touch other transactions when cancelSeries is not requested', async () => {
		vi.mocked(prisma.transaction.findUnique).mockResolvedValue({
			householdId: 'h1',
			householdMemberId: 'm1',
			recurrenceRule: { seriesId: 's1' },
		} as never)
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: 'member' } as never)
		vi.mocked(prisma.transaction.delete).mockResolvedValue({ id: 't1' } as never)

		await deleteTransaction('t1')

		expect(prisma.transaction.updateMany).not.toHaveBeenCalled()
	})

	it('stops future occurrences by flipping isRecurring off across the series when cancelSeries is requested', async () => {
		vi.mocked(prisma.transaction.findUnique).mockResolvedValue({
			householdId: 'h1',
			householdMemberId: 'm1',
			recurrenceRule: { seriesId: 's1' },
		} as never)
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: 'member' } as never)
		vi.mocked(prisma.transaction.delete).mockResolvedValue({ id: 't1' } as never)

		const result = await deleteTransaction('t1', { cancelSeries: true })

		expect(result.status).toBe(200)
		expect(prisma.transaction.updateMany).toHaveBeenCalledWith({
			where: { householdMemberId: 'm1', recurrenceRule: { path: ['seriesId'], equals: 's1' } },
			data: { isRecurring: false },
		})
	})

	it('does not attempt series cancellation when the transaction has no series', async () => {
		vi.mocked(prisma.transaction.findUnique).mockResolvedValue({ householdId: 'h1', householdMemberId: 'm1', recurrenceRule: null } as never)
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: 'member' } as never)
		vi.mocked(prisma.transaction.delete).mockResolvedValue({ id: 't1' } as never)

		await deleteTransaction('t1', { cancelSeries: true })

		expect(prisma.transaction.updateMany).not.toHaveBeenCalled()
	})
})
