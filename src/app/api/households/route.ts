import type { HouseholdSummary } from '@households/types'

import { NextResponse } from 'next/server'

import { StatusCodes } from 'http-status-codes'

import { authorizedSession } from '@lib/auth/utils'
import { MemberRole } from '@lib/constants/role.enum'
import { householdLogger } from '@lib/logger'
import { prisma } from '@lib/prisma'

export async function GET() {
	try {
		const { session, error: authError } = await authorizedSession()

		if (authError) {
			return NextResponse.json({ error: authError }, { status: authError.status })
		}

		const households = await prisma.household.findMany({
			where: {
				members: {
					some: {
						userId: session!.user.id,
					},
				},
			},
			include: {
				config: true,
				members: {
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
	} catch (error) {
		householdLogger.error('Failed to fetch households: {error}', { error })
		return NextResponse.json({ error: 'Internal server error' }, { status: StatusCodes.INTERNAL_SERVER_ERROR })
	}
}

export const dynamic = 'force-dynamic'
