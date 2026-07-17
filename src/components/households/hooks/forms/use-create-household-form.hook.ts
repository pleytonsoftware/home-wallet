'use client'

import { useEffect } from 'react'

import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { useDetectedCurrency } from '@hooks/use-detected-currency'
import { SplitStrategy } from '@lib/constants/split-strategy.enum'
import { createHouseholdSchema } from '@lib/schemas/household/create-household'

export const useCreateHouseholdForm = (schemaParams: Parameters<typeof createHouseholdSchema>[0]) => {
	const { currency: detectedCurrency } = useDetectedCurrency()

	const form = useForm({
		resolver: zodResolver(createHouseholdSchema(schemaParams)),
		defaultValues: {
			name: '',
			currency: detectedCurrency,
			splitStrategy: SplitStrategy.EQUAL,
			autoCategorize: true,
			fullAddress: '',
		},
	})

	// Browser detection resolves after mount; sync it in unless the user already picked a currency.
	useEffect(() => {
		if (!form.formState.dirtyFields.currency) {
			form.setValue('currency', detectedCurrency)
		}
	}, [detectedCurrency, form.formState.dirtyFields.currency, form])

	return form
}
