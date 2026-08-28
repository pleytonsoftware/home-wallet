import { getActiveMembership } from '@actions/household/active-memberships'
import { authorizedSession } from '@lib/auth/utils'
import { prisma } from '@lib/prisma'

import { createTransactionsBatch } from './create-batch'

vi.mock('@lib/auth/utils', () => ({ authorizedSession: vi.fn() }))
vi.mock('@actions/household/active-memberships', () => ({ getActiveMembership: vi.fn() }))
vi.mock('next-intl/server', () => ({ getTranslations: vi.fn().mockResolvedValue((key: string) => key) }))
vi.mock('@lib/prisma', () => ({
	prisma: {
		monthlyBudget: { findUnique: vi.fn(), findMany: vi.fn().mockResolvedValue([]) },
		category: { findMany: vi.fn() },
		bankAccount: { findMany: vi.fn() },
		transaction: { create: vi.fn(), update: vi.fn() },
		$transaction: vi.fn(),
	},
}))

const SESSION = { user: { id: 'u1' } }

const ROW = {
	name: 'Groceries',
	amount: 42.5,
	type: 'expense',
	date: new Date('2026-08-15T00:00:00.000Z'),
	isRecurring: false,
}

describe('createTransactionsBatch', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		vi.mocked(authorizedSession).mockResolvedValue({ session: SESSION, error: null } as never)
		vi.mocked(prisma.category.findMany).mockResolvedValue([])
		vi.mocked(prisma.bankAccount.findMany).mockResolvedValue([])
	})

	it('returns forbidden when the monthly budget does not exist', async () => {
		vi.mocked(prisma.monthlyBudget.findUnique).mockResolvedValue(null)

		const result = await createTransactionsBatch('b1', { rows: [ROW] } as never)

		expect(result.status).toBe(403)
		expect(prisma.$transaction).not.toHaveBeenCalled()
	})

	it('returns forbidden when the requester does not own the monthly budget', async () => {
		vi.mocked(prisma.monthlyBudget.findUnique).mockResolvedValue({ householdId: 'h1', householdMemberId: 'm2', status: 'active' } as never)
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: 'member' } as never)

		const result = await createTransactionsBatch('b1', { rows: [ROW] } as never)

		expect(result.status).toBe(403)
		expect(prisma.$transaction).not.toHaveBeenCalled()
	})

	it('rejects a batch for a non-active budget', async () => {
		vi.mocked(prisma.monthlyBudget.findUnique).mockResolvedValue({ householdId: 'h1', householdMemberId: 'm1', status: 'draft' } as never)
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: 'member' } as never)

		const result = await createTransactionsBatch('b1', { rows: [ROW] } as never)

		expect(result.success).toBe(false)
		expect(prisma.$transaction).not.toHaveBeenCalled()
	})

	it('rejects an empty rows array', async () => {
		vi.mocked(prisma.monthlyBudget.findUnique).mockResolvedValue({ householdId: 'h1', householdMemberId: 'm1', status: 'active' } as never)
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: 'member' } as never)

		const result = await createTransactionsBatch('b1', { rows: [] } as never)

		expect(result.success).toBe(false)
		expect(prisma.$transaction).not.toHaveBeenCalled()
	})

	it('rejects a batch with more than 50 rows', async () => {
		vi.mocked(prisma.monthlyBudget.findUnique).mockResolvedValue({ householdId: 'h1', householdMemberId: 'm1', status: 'active' } as never)
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: 'member' } as never)

		const rows = Array.from({ length: 51 }, () => ({ ...ROW }))
		const result = await createTransactionsBatch('b1', { rows } as never)

		expect(result.success).toBe(false)
		expect(prisma.$transaction).not.toHaveBeenCalled()
	})

	it('rejects a row referencing a categoryId that does not belong to the household or is not base', async () => {
		vi.mocked(prisma.monthlyBudget.findUnique).mockResolvedValue({ householdId: 'h1', householdMemberId: 'm1', status: 'active' } as never)
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: 'member' } as never)
		vi.mocked(prisma.category.findMany).mockResolvedValue([])

		const result = await createTransactionsBatch('b1', { rows: [{ ...ROW, categoryId: 'ghost' }] } as never)

		expect(result.success).toBe(false)
		expect(prisma.$transaction).not.toHaveBeenCalled()
	})

	it('rejects an income row that is not assigned to the income category, at the right row index', async () => {
		vi.mocked(prisma.monthlyBudget.findUnique).mockResolvedValue({ householdId: 'h1', householdMemberId: 'm1', status: 'active' } as never)
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: 'member' } as never)
		vi.mocked(prisma.category.findMany).mockResolvedValue([{ id: 'c1', name: 'Groceries', isBase: false }] as never)

		const result = await createTransactionsBatch('b1', {
			rows: [ROW, { ...ROW, type: 'income', categoryId: 'c1' }],
		} as never)

		expect(result.success).toBe(false)
		expect(result as { success: false; error: unknown }).toMatchObject({
			error: [expect.objectContaining({ path: ['rows', 1, 'categoryId'] })],
		})
		expect(prisma.$transaction).not.toHaveBeenCalled()
	})

	it('rejects an expense row assigned to the income category', async () => {
		vi.mocked(prisma.monthlyBudget.findUnique).mockResolvedValue({ householdId: 'h1', householdMemberId: 'm1', status: 'active' } as never)
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: 'member' } as never)
		vi.mocked(prisma.category.findMany).mockResolvedValue([{ id: 'c-income', name: 'Income', isBase: true }] as never)

		const result = await createTransactionsBatch('b1', { rows: [{ ...ROW, type: 'expense', categoryId: 'c-income' }] } as never)

		expect(result.success).toBe(false)
		expect(prisma.$transaction).not.toHaveBeenCalled()
	})

	it('rejects a row referencing a sourceAccountId the requester cannot access', async () => {
		vi.mocked(prisma.monthlyBudget.findUnique).mockResolvedValue({ householdId: 'h1', householdMemberId: 'm1', status: 'active' } as never)
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: 'member' } as never)
		vi.mocked(prisma.bankAccount.findMany).mockResolvedValue([])

		const result = await createTransactionsBatch('b1', { rows: [{ ...ROW, sourceAccountId: 'ghost' }] } as never)

		expect(result.success).toBe(false)
		expect(prisma.$transaction).not.toHaveBeenCalled()
	})

	it('collects issues for every failing row instead of failing fast on the first one', async () => {
		vi.mocked(prisma.monthlyBudget.findUnique).mockResolvedValue({ householdId: 'h1', householdMemberId: 'm1', status: 'active' } as never)
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: 'member' } as never)
		vi.mocked(prisma.category.findMany).mockResolvedValue([])
		vi.mocked(prisma.bankAccount.findMany).mockResolvedValue([])

		const result = await createTransactionsBatch('b1', {
			rows: [
				{ ...ROW, categoryId: 'ghost-category' },
				{ ...ROW, sourceAccountId: 'ghost-account' },
			],
		} as never)

		expect(result.success).toBe(false)
		expect(result as { success: false; error: unknown }).toMatchObject({
			error: [expect.objectContaining({ path: ['rows', 0, 'categoryId'] }), expect.objectContaining({ path: ['rows', 1, 'sourceAccountId'] })],
		})
		expect(prisma.$transaction).not.toHaveBeenCalled()
	})

	it('deduplicates category/account lookups across rows sharing the same ids (no N+1)', async () => {
		vi.mocked(prisma.monthlyBudget.findUnique).mockResolvedValue({ householdId: 'h1', householdMemberId: 'm1', status: 'active' } as never)
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: 'member' } as never)
		vi.mocked(prisma.category.findMany).mockResolvedValue([{ id: 'c1', name: 'Food', isBase: false }] as never)
		vi.mocked(prisma.bankAccount.findMany).mockResolvedValue([{ id: 'a1' }] as never)
		vi.mocked(prisma.$transaction).mockResolvedValue([])

		await createTransactionsBatch('b1', {
			rows: [
				{ ...ROW, categoryId: 'c1', sourceAccountId: 'a1' },
				{ ...ROW, categoryId: 'c1', sourceAccountId: 'a1' },
				{ ...ROW, categoryId: 'c1', sourceAccountId: 'a1' },
			],
		} as never)

		expect(prisma.category.findMany).toHaveBeenCalledTimes(1)
		expect(prisma.category.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ id: { in: ['c1'] } }) }))
		expect(prisma.bankAccount.findMany).toHaveBeenCalledTimes(1)
		expect(prisma.bankAccount.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ id: { in: ['a1'] } }) }))
	})

	it('creates every row atomically and returns the serialized batch', async () => {
		vi.mocked(prisma.monthlyBudget.findUnique).mockResolvedValue({ householdId: 'h1', householdMemberId: 'm1', status: 'active' } as never)
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: 'member' } as never)
		vi.mocked(prisma.$transaction).mockResolvedValue([
			{
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
			},
			{
				id: 't2',
				monthlyBudgetId: 'b1',
				name: 'Coffee',
				amount: 3.5,
				type: 'expense',
				category: null,
				sourceAccount: null,
				note: null,
				date: new Date('2026-08-15T00:00:00.000Z'),
				isRecurring: false,
				recurrenceRule: null,
				createdAt: new Date('2026-08-15T00:00:00.000Z'),
			},
		] as never)

		const result = await createTransactionsBatch('b1', { rows: [ROW, { ...ROW, name: 'Coffee', amount: 3.5 }] } as never)

		expect(result.status).toBe(201)
		expect(prisma.$transaction).toHaveBeenCalledTimes(1)
		expect(result as { success: true; data: unknown[] }).toMatchObject({
			data: [expect.objectContaining({ id: 't1' }), expect.objectContaining({ id: 't2' })],
		})
	})

	it('stamps a fresh series id and occurrenceCount on a recurring row', async () => {
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
		vi.mocked(prisma.$transaction).mockImplementation((cb) => (cb as (tx: typeof prisma) => unknown)(prisma) as never)

		await createTransactionsBatch('b1', {
			rows: [{ ...ROW, name: 'Rent', amount: 1200, isRecurring: true, recurrenceRule: { frequency: 'monthly' } }],
		} as never)

		expect(prisma.transaction.update).toHaveBeenCalledWith({
			where: { id: 't1' },
			data: { recurrenceRule: { frequency: 'monthly', seriesId: 't1', occurrenceCount: 1 } },
			include: { category: true, sourceAccount: true },
		})
	})

	it('carries a newly recurring row into already-existing future budgets', async () => {
		vi.mocked(prisma.monthlyBudget.findUnique).mockResolvedValue({ householdId: 'h1', householdMemberId: 'm1', status: 'active' } as never)
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: 'member' } as never)
		vi.mocked(prisma.monthlyBudget.findMany).mockResolvedValue([{ id: 'b2', month: new Date('2026-09-01T00:00:00.000Z') }] as never)
		vi.mocked(prisma.transaction.create).mockResolvedValue({ id: 't1', monthlyBudgetId: 'b1' } as never)
		vi.mocked(prisma.transaction.update).mockResolvedValue({
			id: 't1',
			monthlyBudgetId: 'b1',
			date: new Date('2026-08-15T00:00:00.000Z'),
			createdAt: new Date('2026-08-15T00:00:00.000Z'),
		} as never)
		vi.mocked(prisma.$transaction).mockImplementation((cb) => (cb as (tx: typeof prisma) => unknown)(prisma) as never)

		await createTransactionsBatch('b1', {
			rows: [
				{
					...ROW,
					name: 'Rent',
					amount: 1200,
					date: new Date('2026-08-15T00:00:00.000Z'),
					isRecurring: true,
					recurrenceRule: { frequency: 'monthly' },
				},
			],
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
})
