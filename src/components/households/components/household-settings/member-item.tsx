import type { HouseholdMemberWithRole } from '@households/types'
import type { FC, ReactNode } from 'react'

import { useCurrentUser } from '@/hooks/use-current-user'

import { useTranslations } from 'next-intl'

import { Avatar, AvatarFallback, AvatarImage } from '@atoms/avatar'
import { cn } from '@cn'
import { useHouseholdContext } from '@households/context/household.context'
import { getInitials } from '@lib/utils/avatar'

interface MemberItemProps {
	member: HouseholdMemberWithRole
	textClassName?: string
	extraNode?: ReactNode
}

export const MemberItem: FC<MemberItemProps> = ({ member, textClassName, extraNode }) => {
	const t = useTranslations('settings.members')
	const { isAdmin } = useHouseholdContext()
	const { user } = useCurrentUser()
	const isCurrentUser = member.id === user?.id

	return (
		<>
			<Avatar className='size-8 rounded-full'>
				<AvatarImage src={member.image ?? undefined} alt={member.name} />
				<AvatarFallback className='rounded-full text-xs uppercase'>{getInitials(member.name)}</AvatarFallback>
			</Avatar>
			<span className={cn('flex min-w-0 flex-col', textClassName)}>
				<span className='truncate'>
					<span className='text-sm font-medium capitalize'>{member.name}</span>
					{isCurrentUser && <span className='text-muted-foreground text-xs'> · {t('you')}</span>}
				</span>
				{isAdmin && <span className='truncate text-xs text-muted-foreground'>{member.email}</span>}
				{extraNode && <span className='truncate text-xs text-muted-foreground'>{extraNode}</span>}
			</span>
		</>
	)
}
