import { prisma } from '@lib/prisma'

import { getBankAccountTransferPlan, planToPrismaOps } from './transfer-plan'

vi.mock('@lib/prisma', () => ({
	prisma: {
		bankAccount: {
			findMany: vi.fn(),
			update: vi.fn(),
			delete: vi.fn(),
		},
	},
}))

describe('getBankAccountTransferPlan', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('marks an account with no active shared member for deletion', async () => {
		vi.mocked(prisma.bankAccount.findMany).mockResolvedValue([{ id: 'a1', name: 'Solo Account', sharedWith: [] }] as never)

		const plan = await getBankAccountTransferPlan('m1')

		expect(plan).toEqual([{ accountId: 'a1', accountName: 'Solo Account', action: 'delete' }])
	})

	it('marks an account with a shared member for transfer to that member', async () => {
		vi.mocked(prisma.bankAccount.findMany).mockResolvedValue([
			{
				id: 'a1',
				name: 'Joint Account',
				sharedWith: [{ id: 's1', householdMemberId: 'm2', householdMember: { user: { name: 'Bob' } } }],
			},
		] as never)

		const plan = await getBankAccountTransferPlan('m1')

		expect(plan).toEqual([
			{
				accountId: 'a1',
				accountName: 'Joint Account',
				action: 'transfer',
				transferTo: { householdMemberId: 'm2', name: 'Bob' },
				sharedRowId: 's1',
			},
		])
	})

	it('resolves a plan entry per owned account', async () => {
		vi.mocked(prisma.bankAccount.findMany).mockResolvedValue([
			{ id: 'a1', name: 'Account 1', sharedWith: [] },
			{ id: 'a2', name: 'Account 2', sharedWith: [{ id: 's1', householdMemberId: 'm3', householdMember: { user: { name: 'Cara' } } }] },
		] as never)

		const plan = await getBankAccountTransferPlan('m1')

		expect(plan).toHaveLength(2)
		expect(plan[0].action).toBe('delete')
		expect(plan[1].action).toBe('transfer')
	})
})

describe('planToPrismaOps', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('builds an update op that reassigns the owner and drops the promoted shared row', () => {
		planToPrismaOps([
			{ accountId: 'a1', accountName: 'Joint', action: 'transfer', transferTo: { householdMemberId: 'm2', name: 'Bob' }, sharedRowId: 's1' },
		])

		expect(prisma.bankAccount.update).toHaveBeenCalledWith({
			where: { id: 'a1' },
			data: { householdMemberId: 'm2', sharedWith: { delete: { id: 's1' } } },
		})
	})

	it('builds a delete op for accounts with no transfer target', () => {
		planToPrismaOps([{ accountId: 'a1', accountName: 'Solo', action: 'delete' }])

		expect(prisma.bankAccount.delete).toHaveBeenCalledWith({ where: { id: 'a1' } })
	})
})
