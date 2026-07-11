import { BadgeCheck, Bell, ChevronsUpDown, LogOut } from 'lucide-react'
import { useTranslations } from 'next-intl'

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@atoms/dropdown-menu'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@atoms/sidebar'
import { UserAvatar, type UserAvatarProps } from '@molecules/user-avatar'

type NavUserProps = {
	user: UserAvatarProps['user']
	/** Called when the user clicks "Sign out". Passed in by the organism. */
	onSignout: () => void
}

/**
 * Atom — user menu pinned to the sidebar footer.
 * Uses `useSidebar` only for dropdown anchor positioning (UI concern).
 * Navigation is delegated to the `onSignout` prop.
 */
export function SidebarUser({ user, onSignout }: NavUserProps) {
	const t = useTranslations('common')
	const { isMobile } = useSidebar()

	return (
		<SidebarMenu>
			<SidebarMenuItem>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size='lg'
							className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer'
						>
							<UserAvatar user={user} />
							<div className='grid flex-1 text-left text-sm leading-tight'>
								<span className='truncate font-medium'>{user.name}</span>
								<span className='truncate text-xs'>{user.email}</span>
							</div>
							<ChevronsUpDown className='ml-auto size-4' />
						</SidebarMenuButton>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						className='w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg'
						side={isMobile ? 'bottom' : 'right'}
						align='end'
						sideOffset={4}
					>
						<DropdownMenuGroup>
							<DropdownMenuItem disabled>
								<BadgeCheck />
								Account
							</DropdownMenuItem>
							<DropdownMenuItem disabled>
								<Bell />
								Notifications
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={onSignout}>
							<LogOut />
							{t('sign-out')}
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			</SidebarMenuItem>
		</SidebarMenu>
	)
}
