'use server'

import type { FullErrorResult, ResponseResult } from '@lib/errors/types'
import type { UpdateHouseholdSettingsInput } from '@lib/schemas/household/update-household-settings'
import type { $ZodIssue } from 'zod/v4/core'

import { getTranslations } from 'next-intl/server'

import { createAction } from '@lib/actions/action-builder'
import { withActiveMembership, withAuthorizedSession, withErrorBoundary } from '@lib/actions/middlewares'
import { BAD_REQUEST, INTERNAL_ERROR, OK } from '@lib/errors'
import { householdLogger } from '@lib/logger'
import { prisma } from '@lib/prisma'
import { updateHouseholdSettingsSchema } from '@lib/schemas/household/update-household-settings'
import { to } from '@lib/utils/to.utils'

export type UpdateHouseholdSettingsResult = ResponseResult<{ id: string }, $ZodIssue[] | string>

const updateHouseholdSettingsChain = createAction<{ householdId: string; input: UpdateHouseholdSettingsInput }>()
	.use(withErrorBoundary(householdLogger, '[updateHouseholdSettings]: {error}'))
	.use(withAuthorizedSession)
	.use(withActiveMembership((ctx) => ctx.householdId, { requireAdmin: true }))
	.handler(async ({ householdId, input }): Promise<UpdateHouseholdSettingsResult> => {
		const createTrans = await getTranslations('common.forms.households.create')
		const validation = await updateHouseholdSettingsSchema(createTrans).safeParseAsync(input)

		if (!validation.success) {
			return BAD_REQUEST(validation.error.issues)
		}

		const { name, fullAddress, currency, splitStrategy, autoCategorize, aiAssistEnabled } = validation.data

		const config = { currency, defaultSplitStrategy: splitStrategy, autoCategorize, aiAssistEnabled }

		const [updateError] = await to(
			prisma.household.update({
				where: { id: householdId },
				data: {
					name: name.trim(),
					fullAddress: fullAddress ?? null,
					config: {
						upsert: { create: config, update: config },
					},
				},
				select: { id: true },
			}),
		)

		if (updateError) {
			return INTERNAL_ERROR(updateError)
		}

		return OK({ id: householdId })
	})

export async function updateHouseholdSettings(
	householdId: string,
	input: UpdateHouseholdSettingsInput,
): Promise<UpdateHouseholdSettingsResult | FullErrorResult> {
	return updateHouseholdSettingsChain({ householdId, input })
}
