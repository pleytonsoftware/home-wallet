'use client'

import type { NavConfig } from './types'

import { NavGroupRenderer } from './nav-group'

type NavBuilderProps = {
	/**
	 * Ordered navigation configuration.
	 * Groups and items are rendered in the order they appear in the array.
	 */
	config: NavConfig
}

/**
 * Generates a full sidebar navigation tree from a declarative `NavConfig`.
 *
 * Reads the authenticated user's permissions via `useAuthReq` and propagates
 * them to every group, item, and sub-item for fine-grained visibility control.
 *
 * Render inside `SidebarContent` (or any `SidebarGroup` container):
 *
 * ```tsx
 * <SidebarContent>
 *   <NavBuilder config={NAV_CONFIG} />
 * </SidebarContent>
 * ```
 */
export function NavBuilder({ config }: NavBuilderProps) {
	return (
		<>
			{config.map((group, index) => (
				<NavGroupRenderer key={group.label ?? index} group={group} />
			))}
		</>
	)
}
