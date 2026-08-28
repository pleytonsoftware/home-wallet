import { getActiveMembership } from '@actions/household/active-memberships'
import { authorizedSession } from '@lib/auth/utils'
import { prisma } from '@lib/prisma'

import { updateTransaction } from './update'

vi.mock('@lib/auth/utils', () => ({ authorizedSession: vi.fn() }))
vi.mock('@actions/household/active-memberships', () => ({ getActiveMembership: vi.fn() }))
vi.mock('next-intl/server', () => ({ getTranslations: vi.fn().mockResolvedValue((key: string) => key) }))
vi.mock('@lib/prisma', () => {
	const prisma = {
		transaction: { findUnique: vi.fn(), update: vi.fn(), create: vi.fn() },
		category: { findFirst: vi.fn() },
		bankAccount: { findFirst: vi.fn() },
		monthlyBudget: { findMany: vi.fn().mockResolvedValue([]) },
		$transaction: vi.fn((cb: (tx: typeof prisma) => unknown) => cb(prisma)),
	}
	return { prisma }
})

const SESSION = { user: { id: 'u1' } }
const BASE_INPUT = {
	name: 'Groceries',
	amount: 42.5,
	type: 'expense',
	date: new Date('2026-08-15T00:00:00.000Z'),
	isRecurring: false,
}

describe('updateTransaction', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		vi.mocked(authorizedSession).mockResolvedValue({ session: SESSION, error: null } as never)
	})

	it('returns forbidden when the transaction does not exist', async () => {
		vi.mocked(prisma.transaction.findUnique).mockResolvedValue(null)

		const result = await updateTransaction('t1', BASE_INPUT as never)

		expect(result.status).toBe(403)
		expect(prisma.transaction.update).not.toHaveBeenCalled()
	})

	it('returns forbidden when the requester is not the owner', async () => {
		vi.mocked(prisma.transaction.findUnique).mockResolvedValue({ householdId: 'h1', householdMemberId: 'm2' } as never)
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: 'member' } as never)

		const result = await updateTransaction('t1', BASE_INPUT as never)

		expect(result.status).toBe(403)
		expect(prisma.transaction.update).not.toHaveBeenCalled()
	})

	it('rejects an income transaction that is not assigned to the income category', async () => {
		vi.mocked(prisma.transaction.findUnique).mockResolvedValue({ householdId: 'h1', householdMemberId: 'm1' } as never)
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: 'member' } as never)
		vi.mocked(prisma.category.findFirst).mockResolvedValue({ id: 'c1', name: 'Groceries', isBase: true } as never)

		const result = await updateTransaction('t1', { ...BASE_INPUT, type: 'income', categoryId: 'c1' } as never)

		expect(result.success).toBe(false)
		expect(prisma.transaction.update).not.toHaveBeenCalled()
	})

	it('rejects an expense transaction assigned to the income category', async () => {
		vi.mocked(prisma.transaction.findUnique).mockResolvedValue({ householdId: 'h1', householdMemberId: 'm1' } as never)
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: 'member' } as never)
		vi.mocked(prisma.category.findFirst).mockResolvedValue({ id: 'c-income', name: 'Income', isBase: true } as never)

		const result = await updateTransaction('t1', { ...BASE_INPUT, type: 'expense', categoryId: 'c-income' } as never)

		expect(result.success).toBe(false)
		expect(prisma.transaction.update).not.toHaveBeenCalled()
	})

	it('updates an income transaction assigned to the income category', async () => {
		vi.mocked(prisma.transaction.findUnique).mockResolvedValue({ householdId: 'h1', householdMemberId: 'm1' } as never)
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: 'member' } as never)
		vi.mocked(prisma.category.findFirst).mockResolvedValue({ id: 'c-income', name: 'Income', isBase: true } as never)
		vi.mocked(prisma.transaction.update).mockResolvedValue({
			id: 't1',
			monthlyBudgetId: 'b1',
			name: 'Paycheck',
			amount: 1000,
			type: 'income',
			category: { id: 'c-income', name: 'Income' },
			sourceAccount: null,
			note: null,
			date: new Date('2026-08-15T00:00:00.000Z'),
			isRecurring: false,
			recurrenceRule: null,
			createdAt: new Date('2026-08-15T00:00:00.000Z'),
		} as never)

		const result = await updateTransaction('t1', { ...BASE_INPUT, name: 'Paycheck', type: 'income', categoryId: 'c-income' } as never)

		expect(result.status).toBe(200)
		expect(prisma.transaction.update).toHaveBeenCalledWith(
			expect.objectContaining({ data: expect.objectContaining({ type: 'income', categoryId: 'c-income' }) }),
		)
	})

	it('updates the transaction when the requester is the owner', async () => {
		vi.mocked(prisma.transaction.findUnique).mockResolvedValue({ householdId: 'h1', householdMemberId: 'm1' } as never)
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: 'member' } as never)
		vi.mocked(prisma.transaction.update).mockResolvedValue({
			id: 't1',
			monthlyBudgetId: 'b1',
			name: 'Groceries',
			amount: 42.5,
			type: 'expense',
			category: null,
			sourceAccount: null,
			note: null,
			date: new Date('2026-08-15T00:00:00.000Z'),
			isRecurring: false,
			recurrenceRule: null,
			createdAt: new Date('2026-08-15T00:00:00.000Z'),
		} as never)

		const result = await updateTransaction('t1', BASE_INPUT as never)

		expect(result.status).toBe(200)
		expect(prisma.transaction.update).toHaveBeenCalledWith(
			expect.objectContaining({ where: { id: 't1' }, data: expect.objectContaining({ name: 'Groceries', amount: 42.5 }) }),
		)
	})

	it('stamps a fresh series id when a transaction is newly marked recurring', async () => {
		vi.mocked(prisma.transaction.findUnique).mockResolvedValue({ householdId: 'h1', householdMemberId: 'm1', recurrenceRule: null } as never)
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: 'member' } as never)
		vi.mocked(prisma.transaction.update).mockResolvedValue({
			id: 't1',
			monthlyBudgetId: 'b1',
			date: new Date('2026-08-15T00:00:00.000Z'),
			createdAt: new Date('2026-08-15T00:00:00.000Z'),
		} as never)

		await updateTransaction('t1', { ...BASE_INPUT, isRecurring: true, recurrenceRule: { frequency: 'monthly' } } as never)

		expect(prisma.transaction.update).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({ recurrenceRule: { frequency: 'monthly', seriesId: 't1', occurrenceCount: 1 } }),
			}),
		)
	})

	it('preserves the existing series id and occurrenceCount when editing an already-recurring transaction', async () => {
		vi.mocked(prisma.transaction.findUnique).mockResolvedValue({
			householdId: 'h1',
			householdMemberId: 'm1',
			recurrenceRule: { frequency: 'monthly', seriesId: 'series-1', occurrenceCount: 3 },
		} as never)
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: 'member' } as never)
		vi.mocked(prisma.transaction.update).mockResolvedValue({
			id: 't1',
			monthlyBudgetId: 'b1',
			date: new Date('2026-08-15T00:00:00.000Z'),
			createdAt: new Date('2026-08-15T00:00:00.000Z'),
		} as never)

		await updateTransaction('t1', { ...BASE_INPUT, isRecurring: true, recurrenceRule: { frequency: 'yearly' } } as never)

		expect(prisma.transaction.update).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({ recurrenceRule: { frequency: 'yearly', seriesId: 'series-1', occurrenceCount: 3 } }),
			}),
		)
	})

	it('carries a newly recurring transaction into already-existing future budgets', async () => {
		vi.mocked(prisma.transaction.findUnique).mockResolvedValue({ householdId: 'h1', householdMemberId: 'm1', recurrenceRule: null } as never)
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: 'member' } as never)
		vi.mocked(prisma.transaction.update).mockResolvedValue({
			id: 't1',
			monthlyBudgetId: 'b1',
			date: new Date('2026-08-15T00:00:00.000Z'),
			createdAt: new Date('2026-08-15T00:00:00.000Z'),
		} as never)
		vi.mocked(prisma.monthlyBudget.findMany).mockResolvedValue([{ id: 'b2', month: new Date('2026-09-01T00:00:00.000Z') }] as never)

		await updateTransaction('t1', {
			...BASE_INPUT,
			name: 'Rent',
			amount: 1200,
			date: new Date('2026-08-15T00:00:00.000Z'),
			isRecurring: true,
			recurrenceRule: { frequency: 'monthly' },
		} as never)

		expect(prisma.transaction.create).toHaveBeenCalledWith({
			data: expect.objectContaining({
				monthlyBudgetId: 'b2',
				date: new Date('2026-09-15T00:00:00.000Z'),
				isRecurring: true,
				recurrenceRule: { frequency: 'monthly', seriesId: 't1', occurrenceCount: 2 },
			}),
		})
	})

	it('does not forward-fill when editing an already-recurring transaction (not a new series)', async () => {
		vi.mocked(prisma.transaction.findUnique).mockResolvedValue({
			householdId: 'h1',
			householdMemberId: 'm1',
			recurrenceRule: { frequency: 'monthly', seriesId: 'series-1', occurrenceCount: 3 },
		} as never)
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: 'member' } as never)
		vi.mocked(prisma.transaction.update).mockResolvedValue({
			id: 't1',
			monthlyBudgetId: 'b1',
			date: new Date('2026-08-15T00:00:00.000Z'),
			createdAt: new Date('2026-08-15T00:00:00.000Z'),
		} as never)

		await updateTransaction('t1', { ...BASE_INPUT, isRecurring: true, recurrenceRule: { frequency: 'yearly' } } as never)

		expect(prisma.monthlyBudget.findMany).not.toHaveBeenCalled()
	})
})
