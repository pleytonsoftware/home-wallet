'use client'

import type { useTranslations } from 'next-intl'

import { useMemo } from 'react'

import { useForm } from 'react-hook-form'

import { zodResolver } from '@hookform/resolvers/zod'
import { type DANGER_SETTINGS_NAMESPACE, buildDeleteConfirmationSchema, type DeleteHouseholdInput } from '@lib/schemas/household/delete-household'

export const useDeleteConfirmationForm = (name: string, t: ReturnType<typeof useTranslations<typeof DANGER_SETTINGS_NAMESPACE>>) => {
	const deleteConfirmationSchema = useMemo(() => buildDeleteConfirmationSchema(name, t), [t, name])

	return useForm<DeleteHouseholdInput>({
		resolver: zodResolver(deleteConfirmationSchema),
		defaultValues: { confirmName: '' },
	})
}
