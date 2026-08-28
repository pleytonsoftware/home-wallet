import { getActiveMembership } from '@actions/household/active-memberships'
import { authorizedSession } from '@lib/auth/utils'
import { prisma } from '@lib/prisma'

import { createTransaction } from './create'

vi.mock('@lib/auth/utils', () => ({ authorizedSession: vi.fn() }))
vi.mock('@actions/household/active-memberships', () => ({ getActiveMembership: vi.fn() }))
vi.mock('next-intl/server', () => ({ getTranslations: vi.fn().mockResolvedValue((key: string) => key) }))
vi.mock('@lib/prisma', () => {
	const prisma = {
		monthlyBudget: { findUnique: vi.fn(), findMany: vi.fn().mockResolvedValue([]) },
		category: { findFirst: vi.fn() },
		bankAccount: { findFirst: vi.fn() },
		transaction: { create: vi.fn(), update: vi.fn() },
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

describe('createTransaction', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		vi.mocked(authorizedSession).mockResolvedValue({ session: SESSION, error: null } as never)
	})

	it('returns forbidden when the monthly budget does not exist', async () => {
		vi.mocked(prisma.monthlyBudget.findUnique).mockResolvedValue(null)

		const result = await createTransaction('b1', BASE_INPUT as never)

		expect(result.status).toBe(403)
		expect(prisma.transaction.create).not.toHaveBeenCalled()
	})

	it('returns forbidden when the requester does not own the monthly budget', async () => {
		vi.mocked(prisma.monthlyBudget.findUnique).mockResolvedValue({ householdId: 'h1', householdMemberId: 'm2', status: 'active' } as never)
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: 'member' } as never)

		const result = await createTransaction('b1', BASE_INPUT as never)

		expect(result.status).toBe(403)
		expect(prisma.transaction.create).not.toHaveBeenCalled()
	})

	it('rejects creating a transaction in a non-active budget', async () => {
		vi.mocked(prisma.monthlyBudget.findUnique).mockResolvedValue({ householdId: 'h1', householdMemberId: 'm1', status: 'draft' } as never)
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: 'member' } as never)

		const result = await createTransaction('b1', BASE_INPUT as never)

		expect(result.success).toBe(false)
		expect(prisma.transaction.create).not.toHaveBeenCalled()
	})

	it('rejects a categoryId that does not belong to the household or is not base', async () => {
		vi.mocked(prisma.monthlyBudget.findUnique).mockResolvedValue({ householdId: 'h1', householdMemberId: 'm1', status: 'active' } as never)
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: 'member' } as never)
		vi.mocked(prisma.category.findFirst).mockResolvedValue(null)

		const result = await createTransaction('b1', { ...BASE_INPUT, categoryId: 'ghost' } as never)

		expect(result.success).toBe(false)
		expect(prisma.transaction.create).not.toHaveBeenCalled()
	})

	it('rejects an income transaction that is not assigned to the income category', async () => {
		vi.mocked(prisma.monthlyBudget.findUnique).mockResolvedValue({ householdId: 'h1', householdMemberId: 'm1', status: 'active' } as never)
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: 'member' } as never)
		vi.mocked(prisma.category.findFirst).mockResolvedValue({ id: 'c1', name: 'Groceries', isBase: true } as never)

		const result = await createTransaction('b1', { ...BASE_INPUT, type: 'income', categoryId: 'c1' } as never)

		expect(result.success).toBe(false)
		expect(prisma.transaction.create).not.toHaveBeenCalled()
	})

	it('rejects an income transaction without a categoryId', async () => {
		vi.mocked(prisma.monthlyBudget.findUnique).mockResolvedValue({ householdId: 'h1', householdMemberId: 'm1', status: 'active' } as never)
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: 'member' } as never)

		const result = await createTransaction('b1', { ...BASE_INPUT, type: 'income' } as never)

		expect(result.success).toBe(false)
		expect(prisma.transaction.create).not.toHaveBeenCalled()
	})

	it('rejects an expense transaction assigned to the income category', async () => {
		vi.mocked(prisma.monthlyBudget.findUnique).mockResolvedValue({ householdId: 'h1', householdMemberId: 'm1', status: 'active' } as never)
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: 'member' } as never)
		vi.mocked(prisma.category.findFirst).mockResolvedValue({ id: 'c-income', name: 'Income', isBase: true } as never)

		const result = await createTransaction('b1', { ...BASE_INPUT, type: 'expense', categoryId: 'c-income' } as never)

		expect(result.success).toBe(false)
		expect(prisma.transaction.create).not.toHaveBeenCalled()
	})

	it('creates an income transaction assigned to the income category', async () => {
		vi.mocked(prisma.monthlyBudget.findUnique).mockResolvedValue({ householdId: 'h1', householdMemberId: 'm1', status: 'active' } as never)
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: 'member' } as never)
		vi.mocked(prisma.category.findFirst).mockResolvedValue({ id: 'c-income', name: 'Income', isBase: true } as never)
		vi.mocked(prisma.transaction.create).mockResolvedValue({
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

		const result = await createTransaction('b1', { ...BASE_INPUT, name: 'Paycheck', type: 'income', categoryId: 'c-income' } as never)

		expect(result.status).toBe(201)
		expect(prisma.transaction.create).toHaveBeenCalledWith(
			expect.objectContaining({ data: expect.objectContaining({ type: 'income', categoryId: 'c-income' }) }),
		)
	})

	it('rejects a sourceAccountId the requester cannot access', async () => {
		vi.mocked(prisma.monthlyBudget.findUnique).mockResolvedValue({ householdId: 'h1', householdMemberId: 'm1', status: 'active' } as never)
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: 'member' } as never)
		vi.mocked(prisma.bankAccount.findFirst).mockResolvedValue(null)

		const result = await createTransaction('b1', { ...BASE_INPUT, sourceAccountId: 'ghost' } as never)

		expect(result.success).toBe(false)
		expect(prisma.transaction.create).not.toHaveBeenCalled()
	})

	it('creates the transaction owned by the requester inside the budget', async () => {
		vi.mocked(prisma.monthlyBudget.findUnique).mockResolvedValue({ householdId: 'h1', householdMemberId: 'm1', status: 'active' } as never)
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: 'member' } as never)
		vi.mocked(prisma.transaction.create).mockResolvedValue({
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

		const result = await createTransaction('b1', BASE_INPUT as never)

		expect(result.status).toBe(201)
		expect(prisma.transaction.create).toHaveBeenCalledWith(
			expect.objectContaining({
				data: expect.objectContaining({
					householdId: 'h1',
					householdMemberId: 'm1',
					monthlyBudgetId: 'b1',
					name: 'Groceries',
					amount: 42.5,
					type: 'expense',
				}),
			}),
		)
	})

	it('stamps a fresh series id and occurrenceCount when the transaction is recurring', async () => {
		vi.mocked(prisma.monthlyBudget.findUnique).mockResolvedValue({ householdId: 'h1', householdMemberId: 'm1', status: 'active' } as never)
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: 'member' } as never)
		vi.mocked(prisma.transaction.create).mockResolvedValue({ id: 't1', monthlyBudgetId: 'b1' } as never)
		vi.mocked(prisma.transaction.update).mockResolvedValue({
			id: 't1',
			monthlyBudgetId: 'b1',
			name: 'Rent',
			amount: 1200,
			type: 'expense',
			category: null,
			sourceAccount: null,
			note: null,
			date: new Date('2026-08-15T00:00:00.000Z'),
			isRecurring: true,
			recurrenceRule: { frequency: 'monthly', seriesId: 't1', occurrenceCount: 1 },
			createdAt: new Date('2026-08-15T00:00:00.000Z'),
		} as never)

		const result = await createTransaction('b1', {
			...BASE_INPUT,
			name: 'Rent',
			isRecurring: true,
			recurrenceRule: { frequency: 'monthly' },
		} as never)

		expect(result.status).toBe(201)
		expect(prisma.transaction.update).toHaveBeenCalledWith({
			where: { id: 't1' },
			data: { recurrenceRule: { frequency: 'monthly', seriesId: 't1', occurrenceCount: 1 } },
			include: { category: true, sourceAccount: true },
		})
	})

	it('carries a newly recurring transaction into already-existing future budgets', async () => {
		vi.mocked(prisma.monthlyBudget.findUnique).mockResolvedValue({ householdId: 'h1', householdMemberId: 'm1', status: 'active' } as never)
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: 'member' } as never)
		const stampedResult = {
			id: 't1',
			monthlyBudgetId: 'b1',
			date: new Date('2026-08-15T00:00:00.000Z'),
			createdAt: new Date('2026-08-15T00:00:00.000Z'),
		}
		vi.mocked(prisma.transaction.create).mockResolvedValue(stampedResult as never)
		vi.mocked(prisma.transaction.update).mockResolvedValue(stampedResult as never)
		vi.mocked(prisma.monthlyBudget.findMany).mockResolvedValue([
			{ id: 'b2', month: new Date('2026-09-01T00:00:00.000Z') },
			{ id: 'b3', month: new Date('2026-10-01T00:00:00.000Z') },
		] as never)

		await createTransaction('b1', {
			...BASE_INPUT,
			name: 'Rent',
			amount: 1200,
			date: new Date('2026-08-15T00:00:00.000Z'),
			isRecurring: true,
			recurrenceRule: { frequency: 'monthly' },
		} as never)

		expect(prisma.transaction.create).toHaveBeenCalledTimes(3)
		expect(prisma.transaction.create).toHaveBeenNthCalledWith(2, {
			data: expect.objectContaining({
				monthlyBudgetId: 'b2',
				date: new Date('2026-09-15T00:00:00.000Z'),
				isRecurring: true,
				recurrenceRule: { frequency: 'monthly', seriesId: 't1', occurrenceCount: 2 },
			}),
		})
		expect(prisma.transaction.create).toHaveBeenNthCalledWith(3, {
			data: expect.objectContaining({
				monthlyBudgetId: 'b3',
				date: new Date('2026-10-15T00:00:00.000Z'),
				isRecurring: true,
				recurrenceRule: { frequency: 'monthly', seriesId: 't1', occurrenceCount: 3 },
			}),
		})
	})

	it('does not touch other budgets when the transaction is not recurring', async () => {
		vi.mocked(prisma.monthlyBudget.findUnique).mockResolvedValue({ householdId: 'h1', householdMemberId: 'm1', status: 'active' } as never)
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: 'member' } as never)
		vi.mocked(prisma.transaction.create).mockResolvedValue({
			id: 't1',
			monthlyBudgetId: 'b1',
			date: new Date('2026-08-15T00:00:00.000Z'),
			createdAt: new Date('2026-08-15T00:00:00.000Z'),
		} as never)

		await createTransaction('b1', BASE_INPUT as never)

		expect(prisma.monthlyBudget.findMany).not.toHaveBeenCalled()
	})
})
