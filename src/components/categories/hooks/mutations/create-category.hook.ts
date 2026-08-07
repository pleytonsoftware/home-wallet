import type { CreateCategoryInput } from '@lib/schemas/category/create-category'

import { createCategory } from '@actions/category/create'
import { mutationOptions } from '@tanstack/react-query'

type CreateCategoryResponse = Awaited<ReturnType<typeof createCategory>>

export const createCategoryMutationOptions = (
	householdId: string,
	opts?: Omit<Parameters<typeof mutationOptions<CreateCategoryResponse, unknown, CreateCategoryInput, unknown>>[0], 'mutationFn'>,
) =>
	mutationOptions({
		mutationFn: async (input: CreateCategoryInput) => createCategory(householdId, input),
		...opts,
	})
