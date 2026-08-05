import type { RemovedHouseholdMember } from '@households/types'

import { NextResponse } from 'next/server'

import { z } from 'zod'

import { isActiveMemberOf } from '@actions/household/active-memberships'
import { withAuth, withErrorBoundary, withParamsValidation } from '@lib/api/middlewares'
import { createRoute } from '@lib/api/route-builder'
import { parseMemberRole } from '@lib/constants/role.enum'
import { FORBIDDEN } from '@lib/errors'
import { householdLogger } from '@lib/logger'
import { prisma } from '@lib/prisma'

const paramsSchema = z.object({ id: z.string().min(1) })

export const GET = createRoute<{ params: Promise<{ id: string }> }>()
	.use(withErrorBoundary(householdLogger, '[GET /households/:id/members/removed]: {error}'))
	.use(withAuth)
	.use(withParamsValidation(paramsSchema))
	.handler(async (_request, { params: { id: householdId }, session }) => {
		if (!(await isActiveMemberOf({ userId: session.user.id, householdId }))) {
			const { status, error } = FORBIDDEN()
			return NextResponse.json({ error }, { status })
		}

		const removedMembers = await prisma.householdMember.findMany({
			where: { householdId, removedAt: { not: null } },
			include: { user: { select: { id: true, name: true, email: true, image: true } } },
			orderBy: { removedAt: 'desc' },
		})

		const data: RemovedHouseholdMember[] = removedMembers.map((member) => ({
			id: member.user.id,
			memberId: member.id,
			name: member.user.name,
			email: member.user.email,
			image: member.user.image,
			role: parseMemberRole(member.role),
			removedAt: member.removedAt!.toISOString(),
		}))

		return NextResponse.json(data)
	})

export const dynamic = 'force-dynamic'
