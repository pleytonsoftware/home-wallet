import type { HouseholdDetail } from '@households/types'
import type { MemberRole } from '@lib/constants/role.enum'
import type { UseFormReturn } from 'react-hook-form'

import { useRouter } from '@/i18n/navigation'

import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { HOUSEHOLDS_QUERY_KEYS } from '@households/constants/query-keys'
import { updateMemberRolesMutationOptions } from '@households/hooks/mutations/update-member-roles.hook'
import { logger } from '@lib/logger'
import { applyServerErrors } from '@lib/utils/form'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface RolesFormValues {
	assignments: Record<string, MemberRole>
}

export const useSaveMemberRoles = (household: HouseholdDetail, form: UseFormReturn<RolesFormValues>) => {
	const router = useRouter()
	const queryClient = useQueryClient()
	const t = useTranslations('settings.members')

	return useMutation(
		updateMemberRolesMutationOptions(household.id, {
			onSuccess: async (res, submittedAssignments) => {
				if (!res.success) {
					applyServerErrors(form, res.error, t('error'))
					throw new Error(t('error'))
				}
				await queryClient.invalidateQueries({ queryKey: HOUSEHOLDS_QUERY_KEYS.household(household.id) })
				await queryClient.invalidateQueries({ queryKey: HOUSEHOLDS_QUERY_KEYS.households, exact: true })
				form.reset({ assignments: submittedAssignments })
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
