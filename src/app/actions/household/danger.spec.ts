import { getBankAccountTransferPlan, planToPrismaOps } from '@actions/bank-account/shared/transfer-plan'
import { getActiveMembership } from '@actions/household/active-memberships'
import { authorizedSession } from '@lib/auth/utils'
import { MemberRole } from '@lib/constants/role.enum'
import { prisma } from '@lib/prisma'

import { getLeaveHouseholdImpact, leaveHousehold } from './danger'

vi.mock('@lib/auth/utils', () => ({ authorizedSession: vi.fn() }))
vi.mock('@actions/household/active-memberships', () => ({ getActiveMembership: vi.fn(), isAdminOf: vi.fn() }))
vi.mock('@actions/bank-account/shared/transfer-plan', () => ({ getBankAccountTransferPlan: vi.fn(), planToPrismaOps: vi.fn(() => []) }))
vi.mock('next-intl/server', () => ({ getTranslations: vi.fn().mockResolvedValue((key: string) => key) }))
vi.mock('@lib/prisma', () => ({
	prisma: {
		householdMember: { count: vi.fn(), update: vi.fn(), deleteMany: vi.fn() },
		household: { findUnique: vi.fn(), delete: vi.fn() },
		$transaction: vi.fn((ops: unknown[]) => Promise.resolve(ops)),
	},
}))

const SESSION = { user: { id: 'u1' } }

describe('getLeaveHouseholdImpact', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		vi.mocked(authorizedSession).mockResolvedValue({ session: SESSION, error: null } as never)
	})

	it('returns forbidden when the requester is not an active member', async () => {
		vi.mocked(getActiveMembership).mockResolvedValue(null)

		const result = await getLeaveHouseholdImpact('h1')

		expect(result.status).toBe(403)
	})

	it('returns the bank-account transfer plan for the requester', async () => {
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: 'member' } as never)
		vi.mocked(getBankAccountTransferPlan).mockResolvedValue([{ accountId: 'a1', accountName: 'Solo', action: 'delete' }])

		const result = await getLeaveHouseholdImpact('h1')

		expect(result).toEqual({ status: 200, success: true, data: [{ accountId: 'a1', accountName: 'Solo', action: 'delete' }] })
	})
})

describe('leaveHousehold', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		vi.mocked(authorizedSession).mockResolvedValue({ session: SESSION, error: null } as never)
	})

	it('returns forbidden when the requester is not an active member', async () => {
		vi.mocked(getActiveMembership).mockResolvedValue(null)

		const result = await leaveHousehold('h1')

		expect(result.status).toBe(403)
		expect(prisma.$transaction).not.toHaveBeenCalled()
	})

	it('blocks the last remaining admin from leaving', async () => {
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: MemberRole.ADMIN } as never)
		vi.mocked(prisma.householdMember.count).mockResolvedValue(1)

		const result = await leaveHousehold('h1')

		expect(result.success).toBe(false)
		expect(prisma.$transaction).not.toHaveBeenCalled()
	})

	it('soft-deletes the membership (sets removedAt) instead of hard-deleting the row', async () => {
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: 'member' } as never)
		vi.mocked(getBankAccountTransferPlan).mockResolvedValue([])

		const result = await leaveHousehold('h1')

		expect(result.status).toBe(200)
		expect(prisma.householdMember.update).toHaveBeenCalledWith({ where: { id: 'm1' }, data: { removedAt: expect.any(Date) } })
		expect(prisma.householdMember.deleteMany).not.toHaveBeenCalled()
	})

	it('applies the bank-account transfer plan for accounts the leaver owned', async () => {
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: 'member' } as never)
		vi.mocked(getBankAccountTransferPlan).mockResolvedValue([{ accountId: 'a1', accountName: 'Joint', action: 'transfer' }])

		await leaveHousehold('h1')

		expect(getBankAccountTransferPlan).toHaveBeenCalledWith('m1')
		expect(planToPrismaOps).toHaveBeenCalledWith([{ accountId: 'a1', accountName: 'Joint', action: 'transfer' }])
	})
})
