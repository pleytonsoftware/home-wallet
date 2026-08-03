import { getActiveMembership } from '@actions/household/active-memberships'
import { authorizedSession } from '@lib/auth/utils'
import { prisma } from '@lib/prisma'

import { updateBankAccount } from './update'

vi.mock('@lib/auth/utils', () => ({ authorizedSession: vi.fn() }))
vi.mock('@actions/household/active-memberships', () => ({ getActiveMembership: vi.fn() }))
vi.mock('next-intl/server', () => ({ getTranslations: vi.fn().mockResolvedValue((key: string) => key) }))
vi.mock('@lib/prisma', () => ({
	prisma: {
		bankAccount: { findUnique: vi.fn(), update: vi.fn() },
		bankAccountMember: { deleteMany: vi.fn(), createMany: vi.fn() },
		householdMember: { count: vi.fn() },
		$transaction: vi.fn((ops: unknown[]) => Promise.resolve(ops)),
	},
}))

const SESSION = { user: { id: 'u1' } }

describe('updateBankAccount', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		vi.mocked(authorizedSession).mockResolvedValue({ session: SESSION, error: null } as never)
	})

	it('returns forbidden when the account does not exist', async () => {
		vi.mocked(prisma.bankAccount.findUnique).mockResolvedValue(null)

		const result = await updateBankAccount('a1', { name: 'Checking', type: 'bank', lastFourDigits: '', sharedMemberIds: [] } as never)

		expect(result.status).toBe(403)
	})

	it('returns forbidden when the requester is not the owner', async () => {
		vi.mocked(prisma.bankAccount.findUnique).mockResolvedValue({ householdId: 'h1', householdMemberId: 'owner-id' } as never)
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: 'member' } as never)

		const result = await updateBankAccount('a1', { name: 'Checking', type: 'bank', lastFourDigits: '', sharedMemberIds: [] } as never)

		expect(result.status).toBe(403)
		expect(prisma.$transaction).not.toHaveBeenCalled()
	})

	it('returns forbidden when the requester is not an active member at all', async () => {
		vi.mocked(prisma.bankAccount.findUnique).mockResolvedValue({ householdId: 'h1', householdMemberId: 'm1' } as never)
		vi.mocked(getActiveMembership).mockResolvedValue(null)

		const result = await updateBankAccount('a1', { name: 'Checking', type: 'bank', lastFourDigits: '', sharedMemberIds: [] } as never)

		expect(result.status).toBe(403)
	})

	it('updates scalars and reconciles sharedWith for the owner', async () => {
		vi.mocked(prisma.bankAccount.findUnique).mockResolvedValue({ householdId: 'h1', householdMemberId: 'm1' } as never)
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: 'member' } as never)
		vi.mocked(prisma.householdMember.count).mockResolvedValue(1)

		const result = await updateBankAccount('a1', {
			name: '  Checking  ',
			type: 'credit_card',
			lastFourDigits: '1234',
			sharedMemberIds: ['m2'],
		} as never)

		expect(result.status).toBe(200)
		expect(prisma.bankAccount.update).toHaveBeenCalledWith({
			where: { id: 'a1' },
			data: { name: 'Checking', type: 'credit_card', lastFourDigits: '1234' },
		})
		expect(prisma.bankAccountMember.deleteMany).toHaveBeenCalledWith({
			where: { bankAccountId: 'a1', householdMemberId: { notIn: ['m2'] } },
		})
		expect(prisma.bankAccountMember.createMany).toHaveBeenCalledWith({
			data: [{ bankAccountId: 'a1', householdMemberId: 'm2' }],
			skipDuplicates: true,
		})
	})
})
