'use client'

import type { NavSubItem } from './types'

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
		<SidebarMenuSubItem>
			<SidebarMenuSubButton
				asChild
				isActive={item.isActive}
				size={item.size ?? 'md'}
				className={cn(item.colour && navItemColourMap[item.colour])}
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
		</SidebarMenuSubItem>
	)
}
