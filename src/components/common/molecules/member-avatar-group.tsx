import type { MemberAvatarSummary } from '@molecules/member-avatar'
import type { FC, ReactNode } from 'react'

import { useState } from 'react'

import { AvatarGroup, AvatarGroupCount } from '@atoms/avatar'
import { HoverCard, HoverCardContent, HoverCardDescription, HoverCardHeader, HoverCardTitle, HoverCardTrigger } from '@atoms/hover-card'
import { psp } from '@lib/utils/events'
import { MemberAvatar } from '@molecules/member-avatar'

interface MemberAvatarGroupProps {
	members: Array<MemberAvatarSummary>
	max?: number
	size?: 'default' | 'sm' | 'lg'
}

interface AvatarHoverCardProps {
	trigger: ReactNode
	children: ReactNode
}

/** Cards/links wrap this group; a trigger click must open the card without also activating whatever wraps it. */
const AvatarHoverCard: FC<AvatarHoverCardProps> = ({ trigger, children }) => {
	const [open, setOpen] = useState(false)

	const openOnClick = psp(() => {
		setOpen(true)
	})

	return (
		<HoverCard open={open} onOpenChange={setOpen} openDelay={150}>
			<HoverCardTrigger asChild onClick={openOnClick}>
				{trigger}
			</HoverCardTrigger>
			<HoverCardContent className='w-auto'>{children}</HoverCardContent>
		</HoverCard>
	)
}

export const MemberAvatarGroup: FC<MemberAvatarGroupProps> = ({ members, max = 3, size = 'sm' }) => {
	const visibleMembers = members.slice(0, max)
	const overflowMembers = members.slice(max)

	return (
		<AvatarGroup>
			{visibleMembers.map((member) => (
				<AvatarHoverCard key={member.id} trigger={<MemberAvatar member={member} size={size} />}>
					<HoverCardHeader>
						<HoverCardTitle>{member.name}</HoverCardTitle>
						{member.email && <HoverCardDescription>{member.email}</HoverCardDescription>}
					</HoverCardHeader>
				</AvatarHoverCard>
			))}
			{overflowMembers.length > 0 && (
				<AvatarHoverCard trigger={<AvatarGroupCount>+{overflowMembers.length}</AvatarGroupCount>}>
					<ul className='flex flex-col gap-2'>
						{overflowMembers.map((member) => (
							<li key={member.id} className='flex flex-col'>
								<span className='font-medium'>{member.name}</span>
								{member.email && <span className='text-xs text-muted-foreground'>{member.email}</span>}
							</li>
						))}
					</ul>
				</AvatarHoverCard>
			)}
		</AvatarGroup>
	)
}
