'use client'

import type { FC } from 'react'

import { useLanguage } from '@/hooks/use-language'

import { useTranslations } from 'next-intl'
import { toast } from 'sonner'

import { Avatar, AvatarFallback, AvatarImage } from '@atoms/avatar'
import { HOUSEHOLDS_QUERY_KEYS } from '@households/constants/query-keys'
import { useHouseholdContext } from '@households/context/household.context'
import { hardDeletePreviousMemberMutationOptions } from '@households/hooks/mutations/hard-delete-member.hook'
import { getRemovedMembersOptions } from '@households/hooks/queries/get-removed-members-option'
import { logger } from '@lib/logger'
import { getInitials } from '@lib/utils/avatar'
import { ConfirmSaveButton } from '@molecules/confirm-save-button'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { SettingsSection } from './settings-section'

export const PreviousMembersList: FC = () => {
	const t = useTranslations('settings.members')
	const locale = useLanguage()
	const { household, isAdmin } = useHouseholdContext()
	const queryClient = useQueryClient()
	const { data: removedMembers } = useQuery({ ...getRemovedMembersOptions(household.id), enabled: isAdmin })

	const deleteMutation = useMutation(
		hardDeletePreviousMemberMutationOptions(household.id, {
			onSuccess: async (res) => {
				if (!res.success) {
					toast.error(t('previous.delete-error'))
					return
				}
				await queryClient.invalidateQueries({ queryKey: HOUSEHOLDS_QUERY_KEYS.removedMembers(household.id) })
				toast.success(t('previous.delete-success'))
			},
			onError: (err) => {
				logger.error('An error has ocurred: {err}', { err })
				toast.error(t('previous.delete-error'))
			},
		}),
	)

	if (!isAdmin || !removedMembers?.length) return null

	return (
		<SettingsSection title={t('previous.title')} description={t('previous.subtitle')}>
			<ul className='flex flex-col gap-2'>
				{removedMembers.map((member) => (
					<li key={member.memberId} className='flex items-center gap-3 rounded-lg border border-transparent bg-muted/40 px-2.5 py-2'>
						<Avatar className='size-8 rounded-full'>
							<AvatarImage src={member.image ?? undefined} alt={member.name} />
							<AvatarFallback className='rounded-full text-xs uppercase'>{getInitials(member.name)}</AvatarFallback>
						</Avatar>
						<span className='flex min-w-0 flex-1 flex-col'>
							<span className='truncate text-sm'>{member.name}</span>
							<span className='truncate text-xs text-muted-foreground'>
								{t('previous.removed-on', { date: new Date(member.removedAt).toLocaleDateString(locale) })}
							</span>
						</span>
						<ConfirmSaveButton
							type='button'
							variant='ghost'
							size='sm'
							className='text-destructive hover:text-destructive'
							loading={deleteMutation.isPending}
							confirmVariant='destructive'
							dialogTitle={t('previous.delete-confirm-title')}
							dialogDescription={t('previous.delete-confirm-description', { name: member.name })}
							confirm={t('previous.delete-confirm-button')}
							onConfirmClick={() => deleteMutation.mutate(member.memberId)}
						>
							{t('previous.delete-trigger')}
						</ConfirmSaveButton>
					</li>
				))}
			</ul>
		</SettingsSection>
	)
}
