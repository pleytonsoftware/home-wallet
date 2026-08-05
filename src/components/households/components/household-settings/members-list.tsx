'use client'

import type { FC } from 'react'

import { useTranslations } from 'next-intl'

import { Badge } from '@atoms/badge'
import { useCurrentUser } from '@hooks/use-current-user'
import { MemberItem } from '@households/components/household-settings/member-item'
import { SettingsSection } from '@households/components/household-settings/settings-section'
import { useHouseholdContext } from '@households/context/household.context'
import { MemberRole } from '@lib/constants/role.enum'

/** Read-only roster of current household members — visible to every member, regardless of role. */
export const MembersList: FC = () => {
	const t = useTranslations('settings.members')
	const tRoles = useTranslations('common.fields.roles.members')
	const { household } = useHouseholdContext()
	const { user } = useCurrentUser()

	return (
		<SettingsSection title={t('list.title')} description={t('list.subtitle')}>
			<ul className='flex max-h-72 flex-col gap-2 overflow-y-auto pr-1'>
				{household.members.map((member) => (
					<li key={member.memberId} className='flex items-center gap-3 rounded-lg border border-transparent bg-muted/40 px-2.5 py-2'>
						<MemberItem member={member} />
						<Badge variant={member.role === MemberRole.ADMIN ? 'default' : 'secondary'} className='ml-auto'>
							{member.role === MemberRole.ADMIN ? tRoles('admin') : tRoles('member')}
						</Badge>
					</li>
				))}
			</ul>
		</SettingsSection>
	)
}
