import { getBankAccountTransferPlan, planToPrismaOps } from '@actions/bank-account/shared/transfer-plan'
import { getActiveMembership } from '@actions/household/active-memberships'
import { authorizedSession } from '@lib/auth/utils'
import { MemberRole } from '@lib/constants/role.enum'
import { prisma } from '@lib/prisma'

import { removeMember } from './remove-member'

vi.mock('@lib/auth/utils', () => ({ authorizedSession: vi.fn() }))
vi.mock('@actions/household/active-memberships', () => ({ getActiveMembership: vi.fn() }))
vi.mock('@actions/bank-account/shared/transfer-plan', () => ({ getBankAccountTransferPlan: vi.fn(), planToPrismaOps: vi.fn(() => []) }))
vi.mock('next-intl/server', () => ({ getTranslations: vi.fn().mockResolvedValue((key: string) => key) }))
vi.mock('@lib/prisma', () => ({
	prisma: {
		householdMember: { findFirst: vi.fn(), count: vi.fn(), update: vi.fn() },
		$transaction: vi.fn((ops: unknown[]) => Promise.resolve(ops)),
	},
}))

const SESSION = { user: { id: 'u1' } }

describe('removeMember', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		vi.mocked(authorizedSession).mockResolvedValue({ session: SESSION, error: null } as never)
	})

	it('returns forbidden when the requester is not an admin', async () => {
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: MemberRole.MEMBER })

		const result = await removeMember('h1', 'm2')

		expect(result.status).toBe(403)
		expect(prisma.$transaction).not.toHaveBeenCalled()
	})

	it('rejects targeting your own membership, pointing to leave instead', async () => {
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: MemberRole.ADMIN })

		const result = await removeMember('h1', 'm1')

		expect(result.success).toBe(false)
		expect(prisma.$transaction).not.toHaveBeenCalled()
	})

	it('returns forbidden when the target is not an active member of the household', async () => {
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: MemberRole.ADMIN })
		vi.mocked(prisma.householdMember.findFirst).mockResolvedValue(null)

		const result = await removeMember('h1', 'm2')

		expect(result.status).toBe(403)
	})

	it('blocks removing the last remaining admin', async () => {
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: MemberRole.ADMIN })
		vi.mocked(prisma.householdMember.findFirst).mockResolvedValue({ id: 'm2', role: 'admin' } as never)
		vi.mocked(prisma.householdMember.count).mockResolvedValue(1)

		const result = await removeMember('h1', 'm2')

		expect(result.success).toBe(false)
		expect(prisma.$transaction).not.toHaveBeenCalled()
	})

	it('deactivates the target and applies their bank-account transfer plan', async () => {
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: MemberRole.ADMIN })
		vi.mocked(prisma.householdMember.findFirst).mockResolvedValue({ id: 'm2', role: 'member' } as never)
		vi.mocked(getBankAccountTransferPlan).mockResolvedValue([])

		const result = await removeMember('h1', 'm2')

		expect(result.status).toBe(200)
		expect(getBankAccountTransferPlan).toHaveBeenCalledWith('m2')
		expect(planToPrismaOps).toHaveBeenCalledWith([])
		expect(prisma.$transaction).toHaveBeenCalled()
	})
})
