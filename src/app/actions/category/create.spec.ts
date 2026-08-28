import { getActiveMembership } from '@actions/household/active-memberships'
import { PrismaClientKnownRequestError } from '@hw-prisma/internal/prismaNamespace'
import { authorizedSession } from '@lib/auth/utils'
import { prisma } from '@lib/prisma'

import { createCategory } from './create'

vi.mock('@lib/auth/utils', () => ({ authorizedSession: vi.fn() }))
vi.mock('@actions/household/active-memberships', () => ({ getActiveMembership: vi.fn() }))
vi.mock('next-intl/server', () => ({ getTranslations: vi.fn().mockResolvedValue((key: string) => key) }))
vi.mock('@lib/prisma', () => ({
	prisma: {
		category: { create: vi.fn() },
	},
}))

const SESSION = { user: { id: 'u1' } }

describe('createCategory', () => {
	beforeEach(() => {
		vi.clearAllMocks()
		vi.mocked(authorizedSession).mockResolvedValue({ session: SESSION, error: null } as never)
	})

	it('returns forbidden when the requester is not an active member of the household', async () => {
		vi.mocked(getActiveMembership).mockResolvedValue(null)

		const result = await createCategory('h1', { name: 'Groceries', color: 'green' } as never)

		expect(result.status).toBe(403)
		expect(prisma.category.create).not.toHaveBeenCalled()
	})

	it('returns a validation error for an empty name', async () => {
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: 'member' } as never)

		const result = await createCategory('h1', { name: '', color: 'green' } as never)

		expect(result.success).toBe(false)
		expect(prisma.category.create).not.toHaveBeenCalled()
	})

	it('creates a household-scoped, non-base category', async () => {
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: 'member' } as never)
		vi.mocked(prisma.category.create).mockResolvedValue({ id: 'c1' } as never)

		const result = await createCategory('h1', { name: '  Groceries  ', color: 'green', icon: 'shopping-cart' } as never)

		expect(result.status).toBe(201)
		expect(prisma.category.create).toHaveBeenCalledWith({
			data: { householdId: 'h1', name: 'Groceries', color: 'green', icon: 'shopping-cart', isBase: false },
		})
	})

	it('returns a conflict when the category name already exists for the household', async () => {
		vi.mocked(getActiveMembership).mockResolvedValue({ id: 'm1', role: 'member' } as never)
		vi.mocked(prisma.category.create).mockRejectedValue(
			new PrismaClientKnownRequestError('Unique constraint failed', { code: 'P2002', clientVersion: '7.8.0' }),
		)

		const result = await createCategory('h1', { name: 'Groceries', color: 'green', icon: 'shopping-cart' } as never)

		expect(result.status).toBe(409)
		expect(result.success).toBe(false)
	})
})
