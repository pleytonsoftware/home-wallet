import { getActiveMembership } from '@actions/household/active-memberships'
import { MemberRole } from '@lib/constants/role.enum'

import { withActiveMembership } from './active-membership'

vi.mock('@actions/household/active-memberships', () => ({ getActiveMembership: vi.fn() }))

const session = { user: { id: 'u1' } }

describe('withActiveMembership', () => {
	beforeEach(() => {
		vi.clearAllMocks()
	})

	it('calls next with the membership when the requester is an active member', async () => {
		const membership = { id: 'm1', role: MemberRole.MEMBER }
		vi.mocked(getActiveMembership).mockResolvedValue(membership)
		const next = vi.fn().mockReturnValue({ ok: true })

		const result = await withActiveMembership<{ householdId: string; session: never }>((ctx) => ctx.householdId)(
			{ householdId: 'h1', session } as never,
			next,
		)

		expect(getActiveMembership).toHaveBeenCalledWith({ userId: 'u1', householdId: 'h1' })
		expect(next).toHaveBeenCalledWith({ membership })
		expect(result).toEqual({ ok: true })
	})

	it('returns FORBIDDEN and skips next when the requester is not an active member', async () => {
		vi.mocked(getActiveMembership).mockResolvedValue(null)
		const next = vi.fn()

		const result = await withActiveMembership<{ householdId: string; session: never }>((ctx) => ctx.householdId)(
			{ householdId: 'h1', session } as never,
			next,
		)

		expect(next).not.toHaveBeenCalled()
		expect(result).toMatchObject({ status: 403, success: false, error: 'Forbidden' })
	})

	it('returns FORBIDDEN when requireAdmin is set and the member is not an admin', async () => {
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: MemberRole.MEMBER })
		const next = vi.fn()

		const result = await withActiveMembership<{ householdId: string; session: never }>((ctx) => ctx.householdId, { requireAdmin: true })(
			{ householdId: 'h1', session } as never,
			next,
		)

		expect(next).not.toHaveBeenCalled()
		expect(result).toMatchObject({ status: 403, success: false })
	})

	it('calls next when requireAdmin is set and the member is an admin', async () => {
		const membership = { id: 'm1', role: MemberRole.ADMIN }
		vi.mocked(getActiveMembership).mockResolvedValue(membership)
		const next = vi.fn().mockReturnValue({ ok: true })

		const result = await withActiveMembership<{ householdId: string; session: never }>((ctx) => ctx.householdId, { requireAdmin: true })(
			{ householdId: 'h1', session } as never,
			next,
		)

		expect(next).toHaveBeenCalledWith({ membership })
		expect(result).toEqual({ ok: true })
	})

	it('returns FORBIDDEN when requireOwner is set and the membership id does not match', async () => {
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: MemberRole.MEMBER })
		const next = vi.fn()

		const result = await withActiveMembership<{ householdId: string; session: never }>((ctx) => ctx.householdId, {
			requireOwner: () => 'm2',
		})({ householdId: 'h1', session } as never, next)

		expect(next).not.toHaveBeenCalled()
		expect(result).toMatchObject({ status: 403, success: false })
	})

	it('calls next when requireOwner is set and the membership id matches', async () => {
		const membership = { id: 'm1', role: MemberRole.MEMBER }
		vi.mocked(getActiveMembership).mockResolvedValue(membership)
		const next = vi.fn().mockReturnValue({ ok: true })

		const result = await withActiveMembership<{ householdId: string; session: never }>((ctx) => ctx.householdId, {
			requireOwner: () => 'm1',
		})({ householdId: 'h1', session } as never, next)

		expect(next).toHaveBeenCalledWith({ membership })
		expect(result).toEqual({ ok: true })
	})
})
