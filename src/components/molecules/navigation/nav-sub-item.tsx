'use client'

import type { NavSubItem } from './types'

import { SidebarMenuSubButton, SidebarMenuSubItem } from '@atoms/sidebar'

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
			<SidebarMenuSubButton asChild isActive={item.isActive} size={item.size ?? 'md'}>
				<a href={item.url}>
					{item.icon && <item.icon />}
					<span>{item.title}</span>
				</a>
			</SidebarMenuSubButton>
		</SidebarMenuSubItem>
	)
}
