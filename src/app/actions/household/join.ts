'use server'

import type { PrismaClientKnownRequestError } from '@/lib/generated/prisma/internal/prismaNamespace'
import type { ResponseResult } from '@lib/errors/types'
import type { $ZodIssue } from 'zod/v4/core'

import { INTERNAL_ERROR } from '@/lib/errors/internal-error'
import { householdLogger } from '@/lib/logger'

import { getTranslations } from 'next-intl/server'

import { authorizedSession } from '@lib/auth/utils'
import { PRISMA_ERRORS } from '@lib/constants/prisma-errors.const'
import { MemberRole } from '@lib/constants/role.enum'
import { BAD_REQUEST, NOT_FOUND, OK } from '@lib/errors'
import { prisma, type Prisma } from '@lib/prisma'
import { joinHouseholdSchema } from '@lib/schemas/household/join-household'
import { to } from '@lib/utils/to.utils'

type HouseholdWithMembers = Prisma.HouseholdGetPayload<{ include: { members: true } }>
export type JoinHouseholdResult = ResponseResult<HouseholdWithMembers, $ZodIssue[] | string>

export async function joinHousehold(code: string): Promise<JoinHouseholdResult> {
	try {
		const { session, error } = await authorizedSession()

		if (error) {
			return error
		}

		const t = await getTranslations('common.error')
		const validation = await joinHouseholdSchema(await getTranslations('onboarding.join.form')).safeParseAsync({ code })

		if (!validation.success) {
			return BAD_REQUEST(validation.error.issues)
		}

		const [findError, foundHousehold] = await to<Prisma.HouseholdGetPayload<{ select: { id: true; code: true } }>, PrismaClientKnownRequestError>(
			prisma.household.findUniqueOrThrow({
				where: {
					code,
				},
				select: {
					id: true,
					code: true,
				},
			}),
		)

		if (findError) {
			if (findError.code === PRISMA_ERRORS.NOT_FOUND) {
				return NOT_FOUND(t('household.join.not-found'))
			} else {
				throw findError
			}
		}

		// TODO: move to a new file for reusability
		// if user already a member, return error
		const [membershipError, existingMembership] = await to(
			prisma.householdMember.findFirst({
				where: {
					householdId: foundHousehold.id,
					userId: session.user.id,
				},
				select: {
					id: true,
				},
			}),
		)

		if (membershipError) {
			throw membershipError
		}

		if (existingMembership) {
			return BAD_REQUEST(t('household.join.already-member'))
		}

		// TODO maybe send a request to household admin to approve the join request instead of automatically adding the user to the household

		const household = await prisma.household.update({
			where: {
				id: foundHousehold.id,
			},
			data: {
				members: {
					create: {
						userId: session.user.id,
						role: MemberRole.MEMBER,
					},
				},
			},
			include: {
				members: true,
			},
		})

		return OK(household)
	} catch (error) {
		householdLogger.error('[joinHousehold]: {error}', { error })
		return INTERNAL_ERROR(error)
	}
}
