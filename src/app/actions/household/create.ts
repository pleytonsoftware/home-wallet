'use server'

import type { FullErrorResult, ResponseResult } from '@lib/errors/types'
import type { $ZodIssue } from 'zod/v4/core'

import { getTranslations } from 'next-intl/server'

import { PrismaClientKnownRequestError } from '@hw-prisma/internal/prismaNamespace'
import { authorizedSession } from '@lib/auth/utils'
import { PRISMA_ERRORS } from '@lib/constants/prisma-errors.const'
import { MemberRole } from '@lib/constants/role.enum'
import { SplitStrategy } from '@lib/constants/split-strategy.enum'
import { BAD_REQUEST } from '@lib/errors/bad-request'
import { CONFLICT } from '@lib/errors/conflict'
import { CREATED } from '@lib/errors/created'
import { INTERNAL_ERROR } from '@lib/errors/internal-error'
import { householdLogger } from '@lib/logger'
import { prisma, type Prisma } from '@lib/prisma'
import { createHouseholdSchema } from '@lib/schemas/household/create-household'
import { DEFAULT_INVITE_CODE_LENGTH, generateInviteCode } from '@lib/utils/invite-code.utils'
import { to } from '@lib/utils/to.utils'

type HouseholdWithMembers = Prisma.HouseholdGetPayload<{ include: { members: true } }>
export type CreateHouseholdResult = ResponseResult<HouseholdWithMembers, $ZodIssue[] | string>

export interface CreateHouseholdConfig {
	currency?: string
	splitStrategy?: SplitStrategy
	autoCategorize?: boolean
	fullAddress?: string
}

export async function createHousehold(name: string, config?: CreateHouseholdConfig): Promise<CreateHouseholdResult | FullErrorResult> {
	try {
		const { session, error } = await authorizedSession()

		if (error) {
			return error
		}

		const [commonTrans, onboardingTrans] = await Promise.all([getTranslations('common.error'), getTranslations('common.forms.households.create')])
		const validation = await createHouseholdSchema(onboardingTrans).safeParseAsync({ name, ...config })

		if (!validation.success) {
			return BAD_REQUEST(validation.error.issues)
		}

		const { data } = validation

		const inviteCode = generateInviteCode(DEFAULT_INVITE_CODE_LENGTH)

		const [householdError, household] = await to(
			prisma.household.create({
				data: {
					name: data.name.trim(),
					code: inviteCode,
					createdById: session.user.id,
					fullAddress: data.fullAddress,
					members: {
						create: {
							userId: session.user.id,
							role: MemberRole.ADMIN,
						},
					},
					config: {
						create: {
							currency: data.currency,
							defaultSplitStrategy: data.splitStrategy,
							autoCategorize: data.autoCategorize,
						},
					},
				},
				include: {
					members: true,
				},
			}),
		)

		if (householdError) {
			if (householdError instanceof PrismaClientKnownRequestError && householdError.code === PRISMA_ERRORS.UNIQUE_CONSTRAINT_VIOLATION) {
				const target = householdError.meta?.target as Array<string> | string | undefined

				if (Array.isArray(target)) {
					let message = commonTrans('conflict')
					if (target.length === 1 && target[0] === 'code') {
						message = onboardingTrans('error.invalid-invite-code')
					} else if (target.length === 2 && target.includes('name') && target.includes('created_by_id')) {
						message = onboardingTrans('name.error.already-exists')
					}

					return CONFLICT(message)
				}
			}

			return INTERNAL_ERROR(householdError)
		}

		return CREATED(household)
	} catch (error) {
		householdLogger.error('[createHousehold]: {error}', { error })
		return INTERNAL_ERROR(error)
	}
}
