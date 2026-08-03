'use client'

import type { FC } from 'react'

import { UserMinusIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { Icon } from '@atoms/icon'
import { HOUSEHOLDS_QUERY_KEYS } from '@households/constants/query-keys'
import { removeMemberMutationOptions } from '@households/hooks/mutations/remove-member.hook'
import { logger } from '@lib/logger'
import { ConfirmSaveButton } from '@molecules/confirm-save-button'
import { useMutation, useQueryClient } from '@tanstack/react-query'

interface RemoveMemberButtonProps {
	householdId: string
	memberId: string
	memberName: string
}

export const RemoveMemberButton: FC<RemoveMemberButtonProps> = ({ householdId, memberId, memberName }) => {
	const t = useTranslations('settings.members')
	const queryClient = useQueryClient()

	const removeMutation = useMutation(
		removeMemberMutationOptions(householdId, {
			onSuccess: async (res) => {
				if (!res.success) {
					toast.error(res.error || t('remove.error'))
					return
				}
				await queryClient.invalidateQueries({ queryKey: HOUSEHOLDS_QUERY_KEYS.household(householdId) })
				await queryClient.invalidateQueries({ queryKey: HOUSEHOLDS_QUERY_KEYS.removedMembers(householdId) })
				toast.success(t('remove.success'))
			},
			onError: (err) => {
				logger.error('An error has ocurred: {err}', { err })
				toast.error(err instanceof Error ? err.message : t('remove.error'))
			},
		}),
	)

	return (
		<ConfirmSaveButton
			type='button'
			variant='ghost'
			size='icon-sm'
			loading={removeMutation.isPending}
			confirmVariant='destructive'
			dialogTitle={t('remove.confirm-title')}
			dialogDescription={t('remove.confirm-description', { name: memberName })}
			confirm={t('remove.confirm-button')}
			onConfirmClick={() => removeMutation.mutate(memberId)}
			aria-label={t('remove.trigger')}
			btnTooltip={<span>{t('remove.trigger')}</span>}
		>
			<Icon IconComponent={UserMinusIcon} size='sm' />
		</ConfirmSaveButton>
	)
}
