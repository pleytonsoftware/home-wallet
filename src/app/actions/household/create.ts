'use server'

import type { SplitStrategy } from '@lib/constants/split-strategy.enum'
import type { FullErrorResult, ResponseResult } from '@lib/errors/types'
import type { $ZodIssue } from 'zod/v4/core'

import { getTranslations } from 'next-intl/server'

import { PrismaClientKnownRequestError } from '@hw-prisma/internal/prismaNamespace'
import { createAction } from '@lib/actions/action-builder'
import { withAuthorizedSession, withErrorBoundary } from '@lib/actions/middlewares'
import { PRISMA_ERRORS } from '@lib/constants/prisma-errors.const'
import { MemberRole } from '@lib/constants/role.enum'
import { BAD_REQUEST, CONFLICT, CREATED, INTERNAL_ERROR } from '@lib/errors'
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

interface CreateHouseholdSeed {
	name: string
	config?: CreateHouseholdConfig
}

const createHouseholdChain = createAction<CreateHouseholdSeed>()
	.use(withErrorBoundary(householdLogger, '[createHousehold]: {error}'))
	.use(withAuthorizedSession)
	.handler(async ({ session, name, config }): Promise<CreateHouseholdResult> => {
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
	})

export async function createHousehold(name: string, config?: CreateHouseholdConfig): Promise<CreateHouseholdResult | FullErrorResult> {
	return createHouseholdChain({ name, config })
}
