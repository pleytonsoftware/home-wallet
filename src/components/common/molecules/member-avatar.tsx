import type { ComponentProps, FC } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@atoms/avatar'
import { getInitials } from '@lib/utils/avatar'

export interface MemberAvatarSummary {
	id: string
	name: string
	image?: string | null
	email?: string
}

interface MemberAvatarProps extends Omit<ComponentProps<typeof Avatar>, 'size' | 'children'> {
	member: MemberAvatarSummary
	size?: 'default' | 'sm' | 'lg'
}

export const MemberAvatar: FC<MemberAvatarProps> = ({ member, size = 'sm', ...props }) => (
	<Avatar size={size} {...props}>
		<AvatarImage src={member.image ?? undefined} alt={member.name} />
		<AvatarFallback>{getInitials(member.name)}</AvatarFallback>
	</Avatar>
)
