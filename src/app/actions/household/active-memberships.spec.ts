import { auth } from '@lib/auth'
import { MemberRole } from '@lib/constants/role.enum'
import { prisma } from '@lib/prisma'

import { getActiveMembership, getActiveMembershipCount, getActiveMembershipsIds, isActiveMemberOf, isAdminOf } from './active-memberships'

vi.mock('@lib/auth', () => ({ auth: vi.fn() }))
vi.mock('@lib/prisma', () => ({
	prisma: {
		householdMember: { findFirst: vi.fn(), count: vi.fn(), findMany: vi.fn() },
	},
}))

describe('getActiveMembership', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('excludes soft-removed members even if a row exists', async () => {
		vi.mocked(prisma.householdMember.findFirst).mockResolvedValue(null)

		const result = await getActiveMembership({ userId: 'u1', householdId: 'h1' })

		expect(result).toBeNull()
		expect(prisma.householdMember.findFirst).toHaveBeenCalledWith({
			where: { userId: 'u1', householdId: 'h1', removedAt: null },
			select: { id: true, role: true },
		})
	})

	it('returns the membership id and parsed role when active', async () => {
		vi.mocked(prisma.householdMember.findFirst).mockResolvedValue({ id: 'm1', role: 'admin' } as never)

		const result = await getActiveMembership({ userId: 'u1', householdId: 'h1' })

		expect(result).toEqual({ id: 'm1', role: MemberRole.ADMIN })
	})

	it('falls back to the current session user when no userId is given', async () => {
		vi.mocked(auth).mockResolvedValue({ isAuthenticated: true, user: { id: 'session-user' } } as never)
		vi.mocked(prisma.householdMember.findFirst).mockResolvedValue(null)

		await getActiveMembership({ householdId: 'h1' })

		expect(prisma.householdMember.findFirst).toHaveBeenCalledWith(
			expect.objectContaining({ where: expect.objectContaining({ userId: 'session-user' }) }),
		)
	})
})

describe('isActiveMemberOf / isAdminOf', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('isActiveMemberOf is false for a removed member', async () => {
		vi.mocked(prisma.householdMember.findFirst).mockResolvedValue(null)
		expect(await isActiveMemberOf({ userId: 'u1', householdId: 'h1' })).toBe(false)
	})

	it('isAdminOf is false when the member is not an admin', async () => {
		vi.mocked(prisma.householdMember.findFirst).mockResolvedValue({ id: 'm1', role: 'member' } as never)
		expect(await isAdminOf({ userId: 'u1', householdId: 'h1' })).toBe(false)
	})

	it('isAdminOf is true when the member is an active admin', async () => {
		vi.mocked(prisma.householdMember.findFirst).mockResolvedValue({ id: 'm1', role: 'admin' } as never)
		expect(await isAdminOf({ userId: 'u1', householdId: 'h1' })).toBe(true)
	})
})

describe('getActiveMembershipCount / getActiveMembershipsIds', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('filters removedAt: null on the count query', async () => {
		vi.mocked(prisma.householdMember.count).mockResolvedValue(2)
		const count = await getActiveMembershipCount('u1')
		expect(count).toBe(2)
		expect(prisma.householdMember.count).toHaveBeenCalledWith({ where: { userId: 'u1', removedAt: null } })
	})

	it('filters removedAt: null on the membership-ids query', async () => {
		vi.mocked(prisma.householdMember.findMany).mockResolvedValue([{ householdId: 'h1' }, { householdId: 'h2' }] as never)
		const ids = await getActiveMembershipsIds('u1')
		expect(ids).toEqual(['h1', 'h2'])
		expect(prisma.householdMember.findMany).toHaveBeenCalledWith({ where: { userId: 'u1', removedAt: null }, select: { householdId: true } })
	})
})
