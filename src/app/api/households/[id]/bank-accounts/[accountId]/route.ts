import type { BankAccountSummary } from '@bank-accounts/types'
import type { ACCOUNT_TYPE } from '@lib/constants/account.enum'

import { NextResponse } from 'next/server'

import { z } from 'zod'

import { getActiveMembership } from '@actions/household/active-memberships'
import { withAuth, withErrorBoundary, withParamsValidation } from '@lib/api/middlewares'
import { createRoute } from '@lib/api/route-builder'
import { FORBIDDEN } from '@lib/errors'
import { bankAccountLogger } from '@lib/logger'
import { prisma } from '@lib/prisma'

const paramsSchema = z.object({ id: z.string().min(1), accountId: z.string().min(1) })

export const GET = createRoute<{ params: Promise<{ id: string; accountId: string }> }>()
	.use(withErrorBoundary(bankAccountLogger, '[GET /households/:id/bank-accounts/:accountId]: {error}'))
	.use(withAuth)
	.use(withParamsValidation(paramsSchema))
	.handler(async (_request, { params: { id: householdId, accountId }, session }) => {
		const membership = await getActiveMembership({ userId: session.user.id, householdId })
		if (!membership) {
			const { status, error } = FORBIDDEN()
			return NextResponse.json({ error }, { status })
		}

		const account = await prisma.bankAccount.findFirst({
			where: {
				id: accountId,
				householdId,
				OR: [{ householdMemberId: membership.id }, { sharedWith: { some: { householdMemberId: membership.id } } }],
			},
			include: {
				householdMember: { include: { user: { select: { id: true, name: true, image: true } } } },
				sharedWith: {
					where: { householdMember: { removedAt: null } },
					include: { householdMember: { include: { user: { select: { id: true, name: true, image: true } } } } },
				},
			},
		})

		if (!account) {
			const { status, error } = FORBIDDEN()
			return NextResponse.json({ error }, { status })
		}

		const data: BankAccountSummary = {
			id: account.id,
			householdId: account.householdId,
			name: account.name,
			type: account.type as ACCOUNT_TYPE,
			lastFourDigits: account.lastFourDigits,
			isOwner: account.householdMemberId === membership.id,
			owner: {
				id: account.householdMember.id,
				name: account.householdMember.user.name,
				image: account.householdMember.user.image,
			},
			sharedWith: account.sharedWith.map((share) => ({
				id: share.householdMember.id,
				name: share.householdMember.user.name,
				image: share.householdMember.user.image,
			})),
			createdAt: account.createdAt.toISOString(),
		}

		return NextResponse.json(data)
	})

export const dynamic = 'force-dynamic'
