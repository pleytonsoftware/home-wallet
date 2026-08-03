import { isAdminOf } from '@actions/household/active-memberships'
import { authorizedSession } from '@lib/auth/utils'
import { prisma } from '@lib/prisma'

import { hardDeletePreviousMember } from './hard-delete-member'

vi.mock('@lib/auth/utils', () => ({ authorizedSession: vi.fn() }))
vi.mock('@actions/household/active-memberships', () => ({ isAdminOf: vi.fn() }))
vi.mock('@lib/prisma', () => ({
	prisma: {
		householdMember: { findFirst: vi.fn(), delete: vi.fn() },
	},
}))

const SESSION = { user: { id: 'u1' } }

describe('hardDeletePreviousMember', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		vi.mocked(authorizedSession).mockResolvedValue({ session: SESSION, error: null } as never)
	})

	it('returns forbidden when the requester is not an admin', async () => {
		vi.mocked(isAdminOf).mockResolvedValue(false)

		const result = await hardDeletePreviousMember('h1', 'm2')

		expect(result.status).toBe(403)
		expect(prisma.householdMember.delete).not.toHaveBeenCalled()
	})

	it('returns forbidden when the target is not already removed', async () => {
		vi.mocked(isAdminOf).mockResolvedValue(true)
		vi.mocked(prisma.householdMember.findFirst).mockResolvedValue(null)

		const result = await hardDeletePreviousMember('h1', 'm2')

		expect(result.status).toBe(403)
		expect(prisma.householdMember.findFirst).toHaveBeenCalledWith({
			where: { id: 'm2', householdId: 'h1', removedAt: { not: null } },
			select: { id: true },
		})
		expect(prisma.householdMember.delete).not.toHaveBeenCalled()
	})

	it('permanently deletes an already-removed member', async () => {
		vi.mocked(isAdminOf).mockResolvedValue(true)
		vi.mocked(prisma.householdMember.findFirst).mockResolvedValue({ id: 'm2' } as never)
		vi.mocked(prisma.householdMember.delete).mockResolvedValue({} as never)

		const result = await hardDeletePreviousMember('h1', 'm2')

		expect(result.status).toBe(200)
		expect(prisma.householdMember.delete).toHaveBeenCalledWith({ where: { id: 'm2' } })
	})
})
