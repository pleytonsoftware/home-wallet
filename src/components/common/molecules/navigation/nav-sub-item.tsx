'use client'

import type { NavSubItem } from './types'

import { Badge } from '@atoms/badge'
import { SidebarMenuSubButton, SidebarMenuSubItem } from '@atoms/sidebar'
import { cn } from '@cn'
import { Link } from '@navigation'

import { isAbsoluteUrl, navItemColourMap } from './utils'

type NavSubItemRendererProps = {
	item: NavSubItem
}

/**
 * Renders a single `SidebarMenuSubItem`.
 * Returns `null` when the user lacks any required permission.
 */
export function NavSubItemRenderer({ item }: NavSubItemRendererProps) {
	return (
		<SidebarMenuSubItem className='relative'>
			<SidebarMenuSubButton
				asChild
				isActive={item.isActive}
				size={item.size ?? 'md'}
				className={cn(item.colour && navItemColourMap[item.colour], item.disabled && 'pointer-events-none opacity-50')}
			>
				{!isAbsoluteUrl(item.url) ? (
					<Link href={item.url}>
						{item.icon && <item.icon />}
						<span>{item.title}</span>
					</Link>
				) : (
					<a href={item.url}>
						{item.icon && <item.icon />}
						<span>{item.title}</span>
					</a>
				)}
			</SidebarMenuSubButton>
			{item.badge && (
				<span className='absolute -bottom-1 right-0'>
					<Badge className='text-[0.5rem] px-1 py-px' variant='secondary'>
						{item.badge}
					</Badge>
				</span>
			)}
		</SidebarMenuSubItem>
	)
}
