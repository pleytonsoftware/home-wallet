import type { HouseholdDetail } from '@households/types'

import { NextResponse } from 'next/server'

import { StatusCodes } from 'http-status-codes'
import { z } from 'zod'

import { authorizedSession } from '@lib/auth/utils'
import { MemberRole, parseMemberRole } from '@lib/constants/role.enum'
import { SplitStrategy } from '@lib/constants/split-strategy.enum'
import { householdLogger } from '@lib/logger'
import { prisma } from '@lib/prisma'
import { isInviteCodeRegenerateOnCooldown } from '@lib/utils/invite-code.utils'

const paramsSchema = z.object({ id: z.string().min(1) })

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
	const parsed = paramsSchema.safeParse(await context.params)
	if (!parsed.success) {
		return NextResponse.json({ error: 'Invalid path params', issues: z.treeifyError(parsed.error).errors }, { status: StatusCodes.BAD_REQUEST })
	}

	const { id } = parsed.data

	const { session, error: authError } = await authorizedSession()
	if (authError) {
		return NextResponse.json({ error: authError }, { status: authError.status })
	}

	try {
		const household = await prisma.household.findFirstOrThrow({
			where: { id, members: { some: { userId: session.user.id } } },
			include: {
				config: true,
				members: {
					include: {
						user: { select: { id: true, name: true, email: true, image: true } },
					},
				},
			},
		})

		const role = parseMemberRole(household.members.find((member) => member.user.id === session.user.id)?.role)

		const detail: HouseholdDetail = {
			id: household.id,
			name: household.name,
			code: role === MemberRole.ADMIN ? household.code : undefined,
			role,
			fullAddress: household.fullAddress,
			isOwner: household.createdById === session.user.id,
			members: household.members.map((member) => ({
				id: member.user.id,
				memberId: member.id,
				name: member.user.name,
				email: member.user.email,
				image: member.user.image,
				role: parseMemberRole(member.role),
			})),
			isInviteCodeOnCooldown: isInviteCodeRegenerateOnCooldown(household.codeRegeneratedAt),
			balance: 0,
			income: 0,
			spent: 0,
			currency: household.config?.currency,
			config: {
				currency: household.config?.currency ?? 'USD',
				defaultSplitStrategy: (household.config?.defaultSplitStrategy as SplitStrategy) ?? SplitStrategy.EQUAL,
				autoCategorize: household.config?.autoCategorize ?? true,
				aiAssistEnabled: household.config?.aiAssistEnabled ?? true,
			},
		}

		return NextResponse.json(detail)
	} catch (error) {
		householdLogger.error('[GET /households/:id]: {error}', { error })
		return NextResponse.json({ error: 'Household not found' }, { status: StatusCodes.NOT_FOUND })
	}
}

export const dynamic = 'force-dynamic'
