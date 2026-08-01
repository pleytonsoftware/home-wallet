import type { HouseholdDetail } from '@households/types'

import { useRouter } from '@/i18n/navigation'

import { useCallback } from 'react'

import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { HOUSEHOLDS_QUERY_KEYS } from '@households/constants/query-keys'
import { deleteHouseholdMutationOptions } from '@households/hooks/mutations/delete-household.hook'
import { leaveHouseholdMutationOptions } from '@households/hooks/mutations/leave-household.hook'
import { regenerateInviteCodeMutationOptions } from '@households/hooks/mutations/regenerate-invite-code.hook'
import { ROUTES } from '@lib/constants/routes.const'
import { logger } from '@lib/logger'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export const useDangerZoneActions = (household: HouseholdDetail) => {
	const router = useRouter()
	const queryClient = useQueryClient()
	const t = useTranslations('settings.danger')

	const invalidateHouseholdsList = useCallback(
		() => queryClient.invalidateQueries({ queryKey: HOUSEHOLDS_QUERY_KEYS.households, exact: true }),
		[queryClient],
	)

	const invalidate = useCallback(async () => {
		await queryClient.invalidateQueries({ queryKey: HOUSEHOLDS_QUERY_KEYS.household(household.id) })
		await invalidateHouseholdsList()
	}, [queryClient, household.id, invalidateHouseholdsList])

	const onError = (err: unknown) => {
		logger.error('An error has ocurred: {err}', { err })
		toast.error(err instanceof Error ? err.message : t('error'))
	}

	const regenerate = useMutation(
		regenerateInviteCodeMutationOptions(household.id, {
			onSuccess: async (res) => {
				if (!res.success) throw new Error(res.error || t('error'))
				await invalidate()
				toast.success(t('regenerate-code.success'))
				router.refresh()
			},
			onError,
		}),
	)

	const leave = useMutation(
		leaveHouseholdMutationOptions(household.id, {
			onSuccess: async (res) => {
				if (!res.success) throw new Error(res.error || t('error'))
				queryClient.removeQueries({ queryKey: HOUSEHOLDS_QUERY_KEYS.household(household.id) })
				await invalidateHouseholdsList()
				toast.success(t('leave.success'))
				router.replace(ROUTES.HOUSEHOLDS)
			},
			onError,
		}),
	)

	const deleteHousehold = useMutation(
		deleteHouseholdMutationOptions(household.id, {
			onSuccess: async (res) => {
				if (!res.success) throw new Error(res.error || t('error'))
				queryClient.removeQueries({ queryKey: HOUSEHOLDS_QUERY_KEYS.household(household.id) })
				await invalidateHouseholdsList()
				toast.success(t('delete.success'))
				router.replace(ROUTES.HOUSEHOLDS)
			},
			onError,
		}),
	)

	return { regenerate, leave, deleteHousehold }
}
