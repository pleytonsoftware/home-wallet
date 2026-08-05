import type { MemberAvatarSummary } from '@molecules/member-avatar'
import type { FC, MouseEvent, ReactNode } from 'react'

import { useCallback, useEffect, useRef, useState } from 'react'

import { AvatarGroup, AvatarGroupCount } from '@atoms/avatar'
import { Popover, PopoverContent, PopoverDescription, PopoverHeader, PopoverTitle, PopoverTrigger } from '@atoms/popover'
import { MemberAvatar } from '@molecules/member-avatar'

const OPEN_DELAY_MS = 150
/** Gives the pointer room to cross the gap between the trigger and the popover content without the card flickering shut. */
const CLOSE_DELAY_MS = 200

interface MemberAvatarGroupProps {
	members: Array<MemberAvatarSummary>
	max?: number
	size?: 'default' | 'sm' | 'lg'
}

interface AvatarPopoverProps {
	trigger: ReactNode
	children: ReactNode
}

/** Cards/links wrap this group; a trigger click must open the popover without also activating whatever wraps it. */
const AvatarPopover: FC<AvatarPopoverProps> = ({ trigger, children }) => {
	const [open, setOpen] = useState(false)
	const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined)

	const scheduleOpen = useCallback(() => {
		clearTimeout(timeoutRef.current)
		timeoutRef.current = setTimeout(() => setOpen(true), OPEN_DELAY_MS)
	}, [])
	const scheduleClose = useCallback(() => {
		clearTimeout(timeoutRef.current)
		timeoutRef.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS)
	}, [])
	const cancelScheduled = useCallback(() => clearTimeout(timeoutRef.current), [])
	const openOnClick = useCallback((event: MouseEvent) => {
		event.preventDefault()
		event.stopPropagation()
		cancelScheduled()
		setOpen(true)
	}, [])

	useEffect(() => cancelScheduled, [])

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild onClick={openOnClick} onMouseEnter={scheduleOpen} onMouseLeave={scheduleClose}>
				{trigger}
			</PopoverTrigger>
			<PopoverContent className='w-auto p-2' onMouseEnter={cancelScheduled} onMouseLeave={scheduleClose}>
				{children}
			</PopoverContent>
		</Popover>
	)
}

export const MemberAvatarGroup: FC<MemberAvatarGroupProps> = ({ members, max = 3, size = 'sm' }) => {
	const visibleMembers = members.slice(0, max)
	const overflowMembers = members.slice(max)

	return (
		<AvatarGroup>
			{visibleMembers.map((member) => (
				<AvatarPopover key={member.id} trigger={<MemberAvatar member={member} size={size} />}>
					<PopoverHeader>
						<PopoverTitle>{member.name}</PopoverTitle>
						{member.email && <PopoverDescription>{member.email}</PopoverDescription>}
					</PopoverHeader>
				</AvatarPopover>
			))}
			{overflowMembers.length > 0 && (
				<AvatarPopover trigger={<AvatarGroupCount>+{overflowMembers.length}</AvatarGroupCount>}>
					<ul className='flex flex-col gap-2'>
						{overflowMembers.map((member) => (
							<li key={member.id} className='flex flex-col'>
								<span className='font-medium'>{member.name}</span>
								{member.email && <span className='text-xs text-muted-foreground'>{member.email}</span>}
							</li>
						))}
					</ul>
				</AvatarPopover>
			)}
		</AvatarGroup>
	)
}
