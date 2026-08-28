'use server'

import type { FullErrorResult, ResponseResult } from '@lib/errors/types'
import type { Prisma } from '@lib/prisma'
import type { $ZodIssue } from 'zod/v4/core'

import { getTranslations } from 'next-intl/server'

import { getActiveMembership } from '@actions/household/active-memberships'
import { PrismaClientKnownRequestError } from '@hw-prisma/internal/prismaNamespace'
import { authorizedSession } from '@lib/auth/utils'
import { PRISMA_ERRORS } from '@lib/constants/prisma-errors.const'
import { BAD_REQUEST, CONFLICT, CREATED, FORBIDDEN, INTERNAL_ERROR } from '@lib/errors'
import { categoryLogger } from '@lib/logger'
import { prisma } from '@lib/prisma'
import { createCategorySchema, type CreateCategoryInput } from '@lib/schemas/category/create-category'
import { to } from '@lib/utils/to.utils'

type CategoryResult = Prisma.CategoryGetPayload<object>
export type CreateCategoryResult = ResponseResult<CategoryResult, $ZodIssue[] | string>

/** Creates a household-scoped category. Used by the inline "create category" flow in the category picker. */
export async function createCategory(householdId: string, input: CreateCategoryInput): Promise<CreateCategoryResult | FullErrorResult> {
	try {
		const { session, error } = await authorizedSession()
		if (error) return error

		const membership = await getActiveMembership({ userId: session.user.id, householdId })
		if (!membership) return FORBIDDEN()

		const t = await getTranslations('common.forms.categories.create')
		const validation = await createCategorySchema(t).safeParseAsync(input)
		if (!validation.success) return BAD_REQUEST(validation.error.issues)

		const { name, color, icon } = validation.data

		const [createError, category] = await to(
			prisma.category.create({
				data: { householdId, name, color, icon, isBase: false },
			}),
		)

		if (createError) {
			if (createError instanceof PrismaClientKnownRequestError && createError.code === PRISMA_ERRORS.UNIQUE_CONSTRAINT_VIOLATION) {
				return CONFLICT(t('name.error.already-exists'))
			}
			return INTERNAL_ERROR(createError)
		}

		return CREATED(category)
	} catch (error) {
		categoryLogger.error('[createCategory]: {error}', { error })
		return INTERNAL_ERROR(error)
	}
}
