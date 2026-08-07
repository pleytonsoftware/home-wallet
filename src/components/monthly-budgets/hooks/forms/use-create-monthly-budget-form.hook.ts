'use client'

import type { CreateMonthlyBudgetInput } from '@lib/schemas/monthly-budget/create-monthly-budget'

import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { createMonthlyBudgetSchema } from '@lib/schemas/monthly-budget/create-monthly-budget'

interface UseCreateMonthlyBudgetFormParams {
	month: string
	schemaParams: Parameters<typeof createMonthlyBudgetSchema>[0]
}

export const useCreateMonthlyBudgetForm = ({ month, schemaParams }: UseCreateMonthlyBudgetFormParams) =>
	useForm<CreateMonthlyBudgetInput>({
		resolver: zodResolver(createMonthlyBudgetSchema(schemaParams)),
		defaultValues: { month, targetAmount: undefined },
	})
