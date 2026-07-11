'use client'

import type { NavGroup } from './types'

import { ChevronDown } from 'lucide-react'

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@atoms/collapsible'
import { SidebarGroup, SidebarGroupAction, SidebarGroupLabel, SidebarMenu } from '@atoms/sidebar'

import { NavItemRenderer } from './nav-item'

type NavGroupRendererProps = {
	group: NavGroup
}

/**
 * Renders a single `SidebarGroup`.
 *
 * - When `group.collapsible` is `true`, wraps the group in a `Collapsible`
 *   and turns the `SidebarGroupLabel` into the collapse trigger.
 * - Renders an optional `SidebarGroupAction` alongside the label.
 *
 * Returns `null` when the user lacks any required permission.
 */
export function NavGroupRenderer({ group }: NavGroupRendererProps) {
	const menu = (
		<SidebarMenu>
			{group.items.map((item) => (
				<NavItemRenderer key={item.title} item={item} />
			))}
		</SidebarMenu>
	)

	// ── Collapsible group ───────────────────────────────────────────────────────
	if (group.collapsible) {
		return (
			<Collapsible defaultOpen={group.defaultOpen} className='group/collapsible'>
				<SidebarGroup>
					{group.label && (
						<SidebarGroupLabel asChild>
							<CollapsibleTrigger>
								{group.label}
								<ChevronDown className='ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180' />
							</CollapsibleTrigger>
						</SidebarGroupLabel>
					)}
					{group.groupAction && (
						<SidebarGroupAction onClick={group.groupAction.onClick}>
							<group.groupAction.icon />
							{group.groupAction.srLabel && <span className='sr-only'>{group.groupAction.srLabel}</span>}
						</SidebarGroupAction>
					)}
					<CollapsibleContent>{menu}</CollapsibleContent>
				</SidebarGroup>
			</Collapsible>
		)
	}

	// ── Static group ────────────────────────────────────────────────────────────
	return (
		<SidebarGroup>
			{group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
			{group.groupAction && (
				<SidebarGroupAction onClick={group.groupAction.onClick}>
					<group.groupAction.icon />
					{group.groupAction.srLabel && <span className='sr-only'>{group.groupAction.srLabel}</span>}
				</SidebarGroupAction>
			)}
			{menu}
		</SidebarGroup>
	)
}
