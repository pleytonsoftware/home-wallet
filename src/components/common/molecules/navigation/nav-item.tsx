'use client'

import type { NavItem } from './types'

import { ChevronRight } from 'lucide-react'

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@atoms/collapsible'
import { SidebarMenuAction, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub } from '@atoms/sidebar'
import { cn } from '@cn'
import { useHouseholdContext } from '@households/context/household.context'
import { Link } from '@navigation'

import { NavSubItemRenderer } from './nav-sub-item'
import { hasAccessToNavItem, isAbsoluteUrl, navItemColourMap } from './utils'

type NavItemRendererProps = {
	item: NavItem
}

/**
 * Renders a single `SidebarMenuItem`.
 *
 * - When `item.items` is non-empty, wraps in a `Collapsible` and renders a
 *   `SidebarMenuSub` for children.
 * - When `item.url` is set on a leaf item, renders an `<a>` via `asChild`.
 * - Renders optional `SidebarMenuAction` and `SidebarMenuBadge` alongside.
 *
 * Returns `null` when the user lacks any required permission.
 */
export function NavItemRenderer({ item }: NavItemRendererProps) {
	const household = useHouseholdContext()
	const hasSubItems = Array.isArray(item.items) && item.items.length > 0

	// ── Collapsible item with sub-menu ──────────────────────────────────────────
	if (hasSubItems) {
		return (
			<Collapsible asChild defaultOpen={item.defaultOpen ?? item.isActive} className='group/collapsible'>
				<SidebarMenuItem className={cn(item.colour && navItemColourMap[item.colour])}>
					<CollapsibleTrigger asChild>
						<SidebarMenuButton {...item} className='cursor-pointer'>
							{item.icon && <item.icon />}
							<span>{item.title}</span>
							<ChevronRight className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90' />
						</SidebarMenuButton>
					</CollapsibleTrigger>
					<CollapsibleContent>
						<SidebarMenuSub>
							{item.items!.filter(hasAccessToNavItem(household.household.role)).map((subItem) => (
								<NavSubItemRenderer key={subItem.title} item={subItem} />
							))}
						</SidebarMenuSub>
					</CollapsibleContent>
				</SidebarMenuItem>
			</Collapsible>
		)
	}

	// ── Leaf item ───────────────────────────────────────────────────────────────
	return (
		<SidebarMenuItem className={cn(item.colour && navItemColourMap[item.colour])}>
			<SidebarMenuButton
				asChild={!!item.url}
				disabled={item.disabled}
				tooltip={item.tooltip}
				isActive={item.isActive}
				variant={item.variant}
				size={item.size}
			>
				{item.url ? (
					!isAbsoluteUrl(item.url) ? (
						<Link href={item.url}>
							{item.icon && <item.icon />}
							<span>{item.title}</span>
						</Link>
					) : (
						<a href={item.url}>
							{item.icon && <item.icon />}
							<span>{item.title}</span>
						</a>
					)
				) : (
					<>
						{item.icon && <item.icon />}
						<span>{item.title}</span>
					</>
				)}
			</SidebarMenuButton>

			{item.action && (
				<SidebarMenuAction showOnHover={item.action.showOnHover} onClick={item.action.onClick}>
					<item.action.icon />
					{item.action.srLabel && <span className='sr-only'>{item.action.srLabel}</span>}
				</SidebarMenuAction>
			)}

			{item.badge !== undefined && <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>}
		</SidebarMenuItem>
	)
}
