'use client'

import type { RecurringSeriesSummary } from '@transactions/types'

import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { updateRecurringSeriesSchema } from '@lib/schemas/transaction/update-recurring-series'

interface UseRecurringSeriesFormParams {
	schemaParams: Parameters<typeof updateRecurringSeriesSchema>[0]
	series: RecurringSeriesSummary
}

export const useRecurringSeriesForm = ({ schemaParams, series }: UseRecurringSeriesFormParams) =>
	useForm({
		resolver: zodResolver(updateRecurringSeriesSchema(schemaParams)),
		mode: 'onChange',
		defaultValues: {
			name: series.name,
			amount: series.amount,
			type: series.type,
			categoryId: series.category?.id,
			sourceAccountId: series.sourceAccount?.id,
			note: series.note ?? '',
			recurrenceRule: {
				frequency: series.frequency,
				interval: series.interval,
				endDate: series.endDate ? new Date(series.endDate) : undefined,
				occurrences: series.occurrences,
			},
		},
	})
