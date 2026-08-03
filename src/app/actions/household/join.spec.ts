import { authorizedSession } from '@lib/auth/utils'
import { prisma } from '@lib/prisma'

import { joinHousehold } from './join'

vi.mock('@lib/auth/utils', () => ({ authorizedSession: vi.fn() }))
vi.mock('next-intl/server', () => ({ getTranslations: vi.fn().mockResolvedValue((key: string) => key) }))
vi.mock('@lib/prisma', () => ({
	prisma: {
		household: { findUniqueOrThrow: vi.fn(), update: vi.fn() },
		householdMember: { findFirst: vi.fn() },
	},
}))

const SESSION = { user: { id: 'u1' } }
const CODE = 'ABC12'

describe('joinHousehold', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		vi.mocked(authorizedSession).mockResolvedValue({ session: SESSION, error: null } as never)
		vi.mocked(prisma.household.findUniqueOrThrow).mockResolvedValue({ id: 'h1', code: CODE } as never)
	})

	it('blocks joining when the user is already an active member', async () => {
		vi.mocked(prisma.householdMember.findFirst).mockResolvedValue({ id: 'm1', removedAt: null } as never)

		const result = await joinHousehold(CODE)

		expect(result.success).toBe(false)
		expect(result).toMatchObject({ error: 'household.join.already-member' })
		expect(prisma.household.update).not.toHaveBeenCalled()
	})

	it('blocks joining with a distinct message when the user was previously removed', async () => {
		vi.mocked(prisma.householdMember.findFirst).mockResolvedValue({ id: 'm1', removedAt: new Date() } as never)

		const result = await joinHousehold(CODE)

		expect(result.success).toBe(false)
		expect(result).toMatchObject({ error: 'household.join.previously-removed' })
		expect(prisma.household.update).not.toHaveBeenCalled()
	})

	it('creates a fresh membership for a user with no prior membership row', async () => {
		vi.mocked(prisma.householdMember.findFirst).mockResolvedValue(null)
		vi.mocked(prisma.household.update).mockResolvedValue({ id: 'h1', members: [] } as never)

		const result = await joinHousehold(CODE)

		expect(result.success).toBe(true)
		expect(prisma.household.update).toHaveBeenCalledWith(
			expect.objectContaining({ where: { id: 'h1' }, data: { members: { create: { userId: 'u1', role: 'MEMBER' } } } }),
		)
	})
})
