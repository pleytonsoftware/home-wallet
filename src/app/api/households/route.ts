import type { HouseholdSummary } from '@households/types'

import { NextResponse } from 'next/server'

import { withAuth, withErrorBoundary } from '@lib/api/middlewares'
import { createRoute } from '@lib/api/route-builder'
import { MemberRole } from '@lib/constants/role.enum'
import { householdLogger } from '@lib/logger'
import { prisma } from '@lib/prisma'

export const GET = createRoute()
	.use(withErrorBoundary(householdLogger, 'Failed to fetch households: {error}'))
	.use(withAuth)
	.handler(async (_request, { session }) => {
		const households = await prisma.household.findMany({
			where: {
				members: {
					some: {
						userId: session.user.id,
						removedAt: null,
					},
				},
			},
			include: {
				config: true,
				members: {
					where: { removedAt: null },
					include: {
						user: {
							select: {
								id: true,
								name: true,
								image: true,
							},
						},
					},
				},
			},
		})

		const householdData: HouseholdSummary[] = households.map((household) => {
			const activeMemberRole = household.members.find((member) => member.user.id === session.user.id)?.role as
				| keyof typeof MemberRole
				| undefined
			const members = household.members.map((member) => member.user)

			return {
				...household,
				id: household.id,
				name: household.name,
				code: activeMemberRole === MemberRole.ADMIN ? household.code : undefined,
				role: activeMemberRole ? MemberRole[activeMemberRole] : MemberRole.MEMBER,
				members,
				balance: 0,
				income: 0,
				spent: 0,
				currency: household.config?.currency,
			} satisfies HouseholdSummary
		})

		return NextResponse.json(householdData)
	})

export const dynamic = 'force-dynamic'
