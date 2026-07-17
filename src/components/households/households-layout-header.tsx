'use client'

import type { FC } from 'react'

import { useTranslations } from 'next-intl'

import { Button } from '@atoms/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from '@atoms/dropdown-menu'
import { useSignOut } from '@auth/hooks/use-signout.hook'
import { cn } from '@cn'
import { Logo } from '@molecules/logo'
import { UserAvatar, type UserAvatarProps } from '@molecules/user-avatar'

type HouseholdsLayoutHeaderProps = {
	maxWidthContentClass?: string
	user: UserAvatarProps['user']
}

export const HouseholdsLayoutHeader: FC<HouseholdsLayoutHeaderProps> = ({ maxWidthContentClass, user }) => {
	const handleSignOut = useSignOut()
	const t = useTranslations('common')

	return (
		<div className='flex items-center bg-background border-b border-border'>
			<div className={cn('flex flex-1 px-4 mt-1 py-2 justify-between mx-auto', maxWidthContentClass)}>
				<div className='flex items-center gap-2'>
					<Logo text={false} className='w-8 shrink-0' />
					<h1 className='text-2xl font-semibold'>{process.env.NEXT_PUBLIC_APP_NAME}</h1>
				</div>
				<DropdownMenu>
					<DropdownMenuTrigger>
						<Button variant='ghost-no-hover' size='icon' as='div' className='flex'>
							<UserAvatar user={user} />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent className='w-32'>
						<DropdownMenuGroup>
							{/* // TODO */}
							<DropdownMenuItem>Profile</DropdownMenuItem>
							<DropdownMenuItem>Settings</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem variant='destructive' onClick={handleSignOut}>
								{t('sign-out')}
							</DropdownMenuItem>
						</DropdownMenuGroup>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</div>
	)
}
