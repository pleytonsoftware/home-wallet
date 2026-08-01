'use client'

import type { NavConfig } from './types'

import { usePathname } from '@navigation'

import { NavGroupRenderer } from './nav-group'
import { resolveNavConfigActiveState } from './utils'

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
 * Derives each entry's `isActive`/`defaultOpen` from the current pathname so the
 * active route is highlighted and its parent group stays expanded. Role-based
 * visibility is applied downstream by the group/item renderers.
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
	const pathname = usePathname()
	const resolvedConfig = resolveNavConfigActiveState(config, pathname)

	return (
		<>
			{resolvedConfig.map((group, index) => (
				<NavGroupRenderer key={group.label ?? index} group={group} />
			))}
		</>
	)
}
