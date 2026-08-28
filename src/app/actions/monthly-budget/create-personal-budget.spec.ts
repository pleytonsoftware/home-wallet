import { getActiveMembership } from '@actions/household/active-memberships'
import { authorizedSession } from '@lib/auth/utils'
import { RECURRENCE_FREQUENCY } from '@lib/constants/recurrence.enum'
import { prisma } from '@lib/prisma'

import { createPersonalMonthlyBudget } from './create-personal-budget'

vi.mock('@lib/auth/utils', () => ({ authorizedSession: vi.fn() }))
vi.mock('@actions/household/active-memberships', () => ({ getActiveMembership: vi.fn() }))
vi.mock('next-intl/server', () => ({ getTranslations: vi.fn().mockResolvedValue((key: string) => key) }))
vi.mock('@lib/prisma', () => {
	const prisma = {
		monthlyBudget: { create: vi.fn(), findFirst: vi.fn() },
		transaction: { findMany: vi.fn().mockResolvedValue([]), create: vi.fn() },
		$transaction: vi.fn((cb: (tx: typeof prisma) => unknown) => cb(prisma)),
	}
	return { prisma }
})

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

	describe('recurrence materialization', () => {
		beforeEach(() => {
			vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: 'member' } as never)
			vi.mocked(prisma.monthlyBudget.findFirst).mockResolvedValue({ month: new Date('2026-07-01T00:00:00.000Z') } as never)
			vi.mocked(prisma.monthlyBudget.create).mockResolvedValue({ id: 'b-aug' } as never)
		})

		it('carries a monthly recurring transaction forward into the new budget', async () => {
			vi.mocked(prisma.transaction.findMany).mockResolvedValue([
				{
					id: 't1',
					name: 'Rent',
					amount: 1200,
					type: 'expense',
					categoryId: 'c1',
					sourceAccountId: null,
					note: null,
					date: new Date('2026-07-15T00:00:00.000Z'),
					recurrenceRule: { frequency: RECURRENCE_FREQUENCY.MONTHLY, seriesId: 't1', occurrenceCount: 1 },
				},
			] as never)

			await createPersonalMonthlyBudget('h1', { month: '2026-08', targetAmount: 2200 })

			expect(prisma.transaction.create).toHaveBeenCalledWith({
				data: {
					householdId: 'h1',
					householdMemberId: 'm1',
					monthlyBudgetId: 'b-aug',
					name: 'Rent',
					amount: 1200,
					type: 'expense',
					categoryId: 'c1',
					sourceAccountId: null,
					note: null,
					date: new Date('2026-08-15T00:00:00.000Z'),
					isRecurring: true,
					recurrenceRule: { frequency: RECURRENCE_FREQUENCY.MONTHLY, seriesId: 't1', occurrenceCount: 2 },
				},
			})
		})

		it('does not carry forward a non-recurring transaction', async () => {
			vi.mocked(prisma.transaction.findMany).mockResolvedValue([])

			await createPersonalMonthlyBudget('h1', { month: '2026-08', targetAmount: 2200 })

			expect(prisma.transaction.create).not.toHaveBeenCalled()
		})

		it('produces multiple rows in the new month for a weekly series', async () => {
			vi.mocked(prisma.transaction.findMany).mockResolvedValue([
				{
					id: 't2',
					name: 'Groceries',
					amount: 50,
					type: 'expense',
					categoryId: null,
					sourceAccountId: null,
					note: null,
					date: new Date('2026-07-06T00:00:00.000Z'),
					recurrenceRule: { frequency: RECURRENCE_FREQUENCY.WEEKLY, seriesId: 't2', occurrenceCount: 1 },
				},
			] as never)

			await createPersonalMonthlyBudget('h1', { month: '2026-08', targetAmount: 2200 })

			expect(prisma.transaction.create).toHaveBeenCalledTimes(5)
		})

		it('uses only the latest materialized row per series as the anchor (no duplication)', async () => {
			vi.mocked(prisma.transaction.findMany).mockResolvedValue([
				{
					id: 't3',
					name: 'Groceries',
					amount: 50,
					type: 'expense',
					categoryId: null,
					sourceAccountId: null,
					note: null,
					date: new Date('2026-07-06T00:00:00.000Z'),
					recurrenceRule: { frequency: RECURRENCE_FREQUENCY.WEEKLY, seriesId: 't3', occurrenceCount: 1 },
				},
				{
					id: 't4',
					name: 'Groceries',
					amount: 50,
					type: 'expense',
					categoryId: null,
					sourceAccountId: null,
					note: null,
					date: new Date('2026-07-27T00:00:00.000Z'),
					recurrenceRule: { frequency: RECURRENCE_FREQUENCY.WEEKLY, seriesId: 't3', occurrenceCount: 4 },
				},
			] as never)

			await createPersonalMonthlyBudget('h1', { month: '2026-08', targetAmount: 2200 })

			// 5 weekly occurrences in August from the latest (t4) anchor alone — not 10 from double-counting both rows.
			expect(prisma.transaction.create).toHaveBeenCalledTimes(5)
		})

		it('produces no rows for a yearly series in a month it is not due, without dropping or erroring', async () => {
			vi.mocked(prisma.transaction.findMany).mockResolvedValue([
				{
					id: 't5',
					name: 'Insurance',
					amount: 300,
					type: 'expense',
					categoryId: null,
					sourceAccountId: null,
					note: null,
					date: new Date('2026-01-10T00:00:00.000Z'),
					recurrenceRule: { frequency: RECURRENCE_FREQUENCY.YEARLY, seriesId: 't5', occurrenceCount: 1 },
				},
			] as never)

			await createPersonalMonthlyBudget('h1', { month: '2026-08', targetAmount: 2200 })

			// No occurrence lands in August — the series is still found (not dropped), it just produces nothing this month.
			expect(prisma.transaction.create).not.toHaveBeenCalled()
		})
	})
})
