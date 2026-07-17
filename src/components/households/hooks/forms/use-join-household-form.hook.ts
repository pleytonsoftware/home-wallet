'use client'

import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { joinHouseholdSchema } from '@lib/schemas/household/join-household'

export const useJoinHouseholdForm = (schemaParams: Parameters<typeof joinHouseholdSchema>[0]) =>
	useForm({
		resolver: zodResolver(joinHouseholdSchema(schemaParams)),
		defaultValues: {
			code: '',
		},
	})
