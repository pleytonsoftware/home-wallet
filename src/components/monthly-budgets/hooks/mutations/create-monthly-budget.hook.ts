import type { CreateMonthlyBudgetInput } from '@lib/schemas/monthly-budget/create-monthly-budget'

import { createPersonalMonthlyBudget } from '@actions/monthly-budget/create-personal-budget'
import { mutationOptions } from '@tanstack/react-query'

type CreateMonthlyBudgetResponse = Awaited<ReturnType<typeof createPersonalMonthlyBudget>>

export const createMonthlyBudgetMutationOptions = (
	householdId: string,
	opts?: Omit<Parameters<typeof mutationOptions<CreateMonthlyBudgetResponse, unknown, CreateMonthlyBudgetInput, unknown>>[0], 'mutationFn'>,
) =>
	mutationOptions({
		mutationFn: async (input: CreateMonthlyBudgetInput) => createPersonalMonthlyBudget(householdId, input),
		...opts,
	})
