import { getActiveMembership } from '@actions/household/active-memberships'
import { authorizedSession } from '@lib/auth/utils'
import { prisma } from '@lib/prisma'

import { createBankAccount } from './create'

vi.mock('@lib/auth/utils', () => ({ authorizedSession: vi.fn() }))
vi.mock('@actions/household/active-memberships', () => ({ getActiveMembership: vi.fn() }))
vi.mock('next-intl/server', () => ({ getTranslations: vi.fn().mockResolvedValue((key: string) => key) }))
vi.mock('@lib/prisma', () => ({
	prisma: {
		bankAccount: { create: vi.fn() },
		householdMember: { count: vi.fn() },
	},
}))

const SESSION = { user: { id: 'u1' } }

describe('createBankAccount', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		vi.mocked(authorizedSession).mockResolvedValue({ session: SESSION, error: null } as never)
	})

	it('returns forbidden when the requester is not an active member of the household', async () => {
		vi.mocked(getActiveMembership).mockResolvedValue(null)

		const result = await createBankAccount('h1', { name: 'Checking', type: 'bank', lastFourDigits: '', sharedMemberIds: [] } as never)

		expect(result.status).toBe(403)
		expect(prisma.bankAccount.create).not.toHaveBeenCalled()
	})

	it('returns a validation error for an empty name', async () => {
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: 'member' } as never)

		const result = await createBankAccount('h1', { name: '', type: 'bank', lastFourDigits: '', sharedMemberIds: [] } as never)

		expect(result.success).toBe(false)
		expect(prisma.bankAccount.create).not.toHaveBeenCalled()
	})

	it('rejects sharedMemberIds that are not active members of the household', async () => {
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: 'member' } as never)
		vi.mocked(prisma.householdMember.count).mockResolvedValue(0)

		const result = await createBankAccount('h1', { name: 'Checking', type: 'bank', lastFourDigits: '', sharedMemberIds: ['ghost'] } as never)

		expect(result.success).toBe(false)
		expect(prisma.bankAccount.create).not.toHaveBeenCalled()
	})

	it('creates the account with the requester as owner and excludes self from sharedMemberIds', async () => {
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: 'member' } as never)
		vi.mocked(prisma.householdMember.count).mockResolvedValue(1)
		vi.mocked(prisma.bankAccount.create).mockResolvedValue({ id: 'a1' } as never)

		const result = await createBankAccount('h1', {
			name: '  Checking  ',
			type: 'bank',
			lastFourDigits: '',
			sharedMemberIds: ['m1', 'm2'],
		} as never)

		expect(result.status).toBe(201)
		expect(prisma.bankAccount.create).toHaveBeenCalledWith({
			data: {
				householdId: 'h1',
				householdMemberId: 'm1',
				name: 'Checking',
				type: 'bank',
				lastFourDigits: null,
				sharedWith: { create: [{ householdMemberId: 'm2' }] },
			},
			include: { sharedWith: true },
		})
	})
})
