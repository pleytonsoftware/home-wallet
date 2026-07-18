import type { UserGenderType } from '@/types/auth'

import { Avatar, AvatarFallback, AvatarImage } from '@atoms/avatar'
import { getInitials, getRandomUniqueAvatar } from '@lib/utils/avatar'

export interface UserAvatarProps {
	user: {
		name: string
		email: string
		image: string | null
		gender?: UserGenderType
	}
}

export const UserAvatar = ({ user }: UserAvatarProps) => {
	const initials = getInitials(user.name)

	return (
		<Avatar className='h-8 w-8 rounded-full'>
			<AvatarImage src={user.image || getRandomUniqueAvatar(user.email, user.gender)} alt={user.name} />
			<AvatarFallback className='rounded-full uppercase'>{initials}</AvatarFallback>
		</Avatar>
	)
}
