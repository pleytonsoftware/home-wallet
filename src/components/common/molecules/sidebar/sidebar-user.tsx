import Link from 'next/link'

import { BadgeCheck, Bell, Building2Icon, CornerDownLeftIcon, ChevronsUpDown, LogOut } from 'lucide-react'
import { useTranslations } from 'next-intl'

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@atoms/dropdown-menu'
import { Icon } from '@atoms/icon'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@atoms/sidebar'
import { ROUTES } from '@lib/constants/routes.const'
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
					<DropdownMenuSeparator />
					<SidebarMenuButton asChild>
						<Link href={ROUTES.HOUSEHOLDS} className='px-3'>
							<span className='relative p-2 pl-0'>
								<Icon className='' IconComponent={Building2Icon} />
								<Icon className='absolute right-1 top-5' size='xs' IconComponent={CornerDownLeftIcon} />
							</span>
							{t('sidebar.households')}
						</Link>
					</SidebarMenuButton>
					<DropdownMenuSeparator />
					<DropdownMenuTrigger asChild>
						<SidebarMenuButton
							size='lg'
							className='data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer'
						>
							<UserAvatar user={user} />
							<div className='grid flex-1 text-left text-sm leading-tight'>
								<span className='truncate font-medium' title={user.name}>
									{user.name}
								</span>
								<span className='truncate text-xs' title={user.email}>
									{user.email}
								</span>
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
