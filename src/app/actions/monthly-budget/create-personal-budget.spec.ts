import { getActiveMembership } from '@actions/household/active-memberships'
import { authorizedSession } from '@lib/auth/utils'
import { prisma } from '@lib/prisma'

import { createPersonalMonthlyBudget } from './create-personal-budget'

vi.mock('@lib/auth/utils', () => ({ authorizedSession: vi.fn() }))
vi.mock('@actions/household/active-memberships', () => ({ getActiveMembership: vi.fn() }))
vi.mock('next-intl/server', () => ({ getTranslations: vi.fn().mockResolvedValue((key: string) => key) }))
vi.mock('@lib/prisma', () => ({
	prisma: {
		monthlyBudget: { create: vi.fn(), findFirst: vi.fn() },
	},
}))

const SESSION = { user: { id: 'u1' } }

describe('createPersonalMonthlyBudget', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		vi.useFakeTimers().setSystemTime(new Date('2026-08-17T12:00:00.000Z'))
		vi.mocked(authorizedSession).mockResolvedValue({ session: SESSION, error: null } as never)
	})

	afterEach(() => {
		vi.useRealTimers()
	})

	it('returns forbidden when the requester is not an active member of the household', async () => {
		vi.mocked(getActiveMembership).mockResolvedValue(null)

		const result = await createPersonalMonthlyBudget('h1', { month: '2026-08', targetAmount: 2200 })

		expect(result.status).toBe(403)
		expect(prisma.monthlyBudget.create).not.toHaveBeenCalled()
	})

	it('returns a validation error for an invalid month', async () => {
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: 'member' } as never)

		const result = await createPersonalMonthlyBudget('h1', { month: 'not-a-month', targetAmount: 2200 } as never)

		expect(result.success).toBe(false)
		expect(prisma.monthlyBudget.create).not.toHaveBeenCalled()
	})

	it('creates the current month when the member has no prior budgets', async () => {
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: 'member' } as never)
		vi.mocked(prisma.monthlyBudget.findFirst).mockResolvedValue(null)
		vi.mocked(prisma.monthlyBudget.create).mockResolvedValue({ id: 'b1' } as never)

		const result = await createPersonalMonthlyBudget('h1', { month: '2026-08', targetAmount: 2200 })

		expect(result.status).toBe(201)
		expect(prisma.monthlyBudget.create).toHaveBeenCalledWith({
			data: {
				householdId: 'h1',
				householdMemberId: 'm1',
				month: new Date('2026-08-01T00:00:00.000Z'),
				type: 'personal',
				status: 'active',
				targetAmount: 2200,
			},
		})
	})

	it('rejects a month that is not exactly the month after the latest created budget', async () => {
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: 'member' } as never)
		vi.mocked(prisma.monthlyBudget.findFirst).mockResolvedValue({ month: new Date('2026-06-01T00:00:00.000Z') } as never)

		const result = await createPersonalMonthlyBudget('h1', { month: '2026-09', targetAmount: 2200 })

		expect(result.success).toBe(false)
		expect(prisma.monthlyBudget.create).not.toHaveBeenCalled()
	})

	it('creates the month immediately after the latest created budget', async () => {
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: 'member' } as never)
		vi.mocked(prisma.monthlyBudget.findFirst).mockResolvedValue({ month: new Date('2026-06-01T00:00:00.000Z') } as never)
		vi.mocked(prisma.monthlyBudget.create).mockResolvedValue({ id: 'b1' } as never)

		const result = await createPersonalMonthlyBudget('h1', { month: '2026-07', targetAmount: 1800 })

		expect(result.status).toBe(201)
		expect(prisma.monthlyBudget.create).toHaveBeenCalledWith({
			data: {
				householdId: 'h1',
				householdMemberId: 'm1',
				month: new Date('2026-07-01T00:00:00.000Z'),
				type: 'personal',
				status: 'active',
				targetAmount: 1800,
			},
		})
	})
})
