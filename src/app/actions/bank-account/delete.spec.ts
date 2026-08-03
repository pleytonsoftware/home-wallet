import { getActiveMembership } from '@actions/household/active-memberships'
import { authorizedSession } from '@lib/auth/utils'
import { prisma } from '@lib/prisma'

import { deleteBankAccount } from './delete'

vi.mock('@lib/auth/utils', () => ({ authorizedSession: vi.fn() }))
vi.mock('@actions/household/active-memberships', () => ({ getActiveMembership: vi.fn() }))
vi.mock('@lib/prisma', () => ({
	prisma: {
		bankAccount: { findUnique: vi.fn(), delete: vi.fn() },
	},
}))

const SESSION = { user: { id: 'u1' } }

describe('deleteBankAccount', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		vi.mocked(authorizedSession).mockResolvedValue({ session: SESSION, error: null } as never)
	})

	it('returns forbidden when the account does not exist', async () => {
		vi.mocked(prisma.bankAccount.findUnique).mockResolvedValue(null)

		const result = await deleteBankAccount('a1')

		expect(result.status).toBe(403)
		expect(prisma.bankAccount.delete).not.toHaveBeenCalled()
	})

	it('returns forbidden when the requester is not the owner', async () => {
		vi.mocked(prisma.bankAccount.findUnique).mockResolvedValue({ householdId: 'h1', householdMemberId: 'owner-id' } as never)
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: 'member' } as never)

		const result = await deleteBankAccount('a1')

		expect(result.status).toBe(403)
		expect(prisma.bankAccount.delete).not.toHaveBeenCalled()
	})

	it('deletes the account when the requester is the owner', async () => {
		vi.mocked(prisma.bankAccount.findUnique).mockResolvedValue({ householdId: 'h1', householdMemberId: 'm1' } as never)
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: 'member' } as never)
		vi.mocked(prisma.bankAccount.delete).mockResolvedValue({} as never)

		const result = await deleteBankAccount('a1')

		expect(result.status).toBe(200)
		expect(prisma.bankAccount.delete).toHaveBeenCalledWith({ where: { id: 'a1' } })
	})
})
