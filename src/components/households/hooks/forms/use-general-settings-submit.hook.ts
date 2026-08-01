import type { HouseholdDetail } from '@households/types'
import type { UpdateHouseholdSettingsInput } from '@lib/schemas/household/update-household-settings'
import type { UseFormReturn } from 'react-hook-form'

import { useRouter } from '@/i18n/navigation'

import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { HOUSEHOLDS_QUERY_KEYS } from '@households/constants/query-keys'
import { updateHouseholdSettingsMutationOptions } from '@households/hooks/mutations/update-household-settings.hook'
import { logger } from '@lib/logger'
import { applyServerErrors } from '@lib/utils/form'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export const useGeneralSettingsSubmit = (household: HouseholdDetail, form: UseFormReturn<UpdateHouseholdSettingsInput>) => {
	const router = useRouter()
	const queryClient = useQueryClient()
	const t = useTranslations('settings.general')

	return useMutation(
		updateHouseholdSettingsMutationOptions(household.id, {
			onSuccess: async (res, data) => {
				if (!res.success) {
					applyServerErrors(form, res.error, t('error'))
					throw new Error(t('error'))
				}
				await queryClient.invalidateQueries({ queryKey: HOUSEHOLDS_QUERY_KEYS.household(household.id) })
				await queryClient.invalidateQueries({ queryKey: HOUSEHOLDS_QUERY_KEYS.households, exact: true })
				form.reset(data)
				toast.success(t('saved'))
				router.refresh()
			},
			onError: (err) => {
				logger.error('An error has ocurred: {err}', { err })

				if (!form.formState.errors.root) {
					form.setError('root', { type: 'manual', message: err instanceof Error ? err.message : t('error') })
				}
				toast.error(err instanceof Error ? err.message : t('error'))
			},
		}),
	)
}
