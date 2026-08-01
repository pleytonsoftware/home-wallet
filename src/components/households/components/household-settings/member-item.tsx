import type { HouseholdMemberWithRole } from '@households/types'
import type { FC } from 'react'

import { useTranslations } from 'next-intl'

import { Avatar, AvatarFallback, AvatarImage } from '@atoms/avatar'
import { getInitials } from '@lib/utils/avatar'

interface MemberItemProps {
	member: HouseholdMemberWithRole
	isCurrentUser: boolean
}

export const MemberItem: FC<MemberItemProps> = ({ member, isCurrentUser }) => {
	const t = useTranslations('settings.members')

	return (
		<>
			<Avatar className='size-8 rounded-full'>
				<AvatarImage src={member.image ?? undefined} alt={member.name} />
				<AvatarFallback className='rounded-full text-xs uppercase'>{getInitials(member.name)}</AvatarFallback>
			</Avatar>
			<span className='flex min-w-0 flex-col'>
				<span className='truncate'>
					{member.name}
					{isCurrentUser && <span className='text-muted-foreground'> · {t('you')}</span>}
				</span>
				<span className='truncate text-xs text-muted-foreground'>{member.email}</span>
			</span>
		</>
	)
}
