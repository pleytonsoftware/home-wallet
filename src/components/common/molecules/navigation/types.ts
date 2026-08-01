import type { MemberRole } from '@/lib/constants/role.enum'
import type { SidebarMenuButton } from '@atoms/sidebar'
import type { LucideIcon } from 'lucide-react'
import type React from 'react'

type UrlRoute = string | '#'

// ─── Tooltip ──────────────────────────────────────────────────────────────────

/**
 * Tooltip configuration passed through to `SidebarMenuButton`.
 * Kept in sync with the underlying prop type so assignments are always valid.
 */
export type NavTooltip = NonNullable<React.ComponentProps<typeof SidebarMenuButton>['tooltip']>

// ─── Action button ────────────────────────────────────────────────────────────

/** A secondary action button rendered on the right side of a nav item row. */
export type NavItemAction = {
	/** Icon to display inside the action button. */
	icon: LucideIcon
	/** Accessible label rendered as `sr-only` text. */
	srLabel?: string
	/** Click handler. */
	onClick?: React.MouseEventHandler<HTMLButtonElement>
	/** When `true`, the action button is only visible on row hover. */
	showOnHover?: boolean
}

// ─── Sub-item ─────────────────────────────────────────────────────────────────

/**
 * A leaf-level navigation entry rendered inside a collapsible `SidebarMenuSub`.
 * Corresponds to `SidebarMenuSubItem` + `SidebarMenuSubButton`.
 */
export type NavSubItem = {
	/** Display title — also used as the React list key. */
	title: string
	/** Destination URL. */
	url: UrlRoute
	/** Optional icon. */
	icon?: LucideIcon
	/** Marks this sub-item as the active route (`data-active`). */
	isActive?: boolean
	/** Button size — defaults to `'md'`. */
	size?: 'sm' | 'md'
} & Pick<NavItem, 'colour' | 'allowedRoles' | 'prefetch'>

// ─── Primary item ─────────────────────────────────────────────────────────────

/**
 * A primary navigation item inside a group.
 * Corresponds to `SidebarMenuItem` + `SidebarMenuButton`.
 *
 * - Provide `url` for a plain link.
 * - Provide `items` to turn it into a collapsible sub-menu (url is ignored).
 * - Provide both `badge` and `action` independently — they compose.
 */
export type NavItem = {
	/** Display title — also used as the React list key. */
	title: string
	/**
	 * Destination URL.
	 * Omit when the item acts as a collapsible parent (`items`) or pure button.
	 */
	url?: UrlRoute
	/** Icon component. */
	icon?: LucideIcon
	/** Marks this item as the active route (`data-active`). */
	isActive?: boolean
	/** Tooltip shown when the sidebar is collapsed to icon-only mode. */
	tooltip?: NavTooltip
	/** Visual variant — defaults to `'default'`. */
	variant?: 'default' | 'outline'
	/** Button size — defaults to `'default'`. */
	size?: 'default' | 'sm' | 'lg'
	/** Badge content rendered inside the item row (e.g. a count). */
	badge?: React.ReactNode
	/** Secondary action button displayed on the right of the row. */
	action?: NavItemAction
	/** Child items — turns the item into a collapsible `SidebarMenuSub`. */
	items?: NavSubItem[]
	/**
	 * Initial expansion state when `items` is provided.
	 * Defaults to the value of `isActive`.
	 */
	defaultOpen?: boolean
	/** Required roles; every entry must be satisfied for the item to render. */
	allowedRoles?: MemberRole[]

	/** Color variant for the group. */
	colour?: 'default' | 'primary' | 'secondary' | 'accent' | 'destructive' | 'warning' | 'info' | 'success'

	/** Pre-fetches the route when clicked. */
	prefetch?: boolean
}

// ─── Group action ─────────────────────────────────────────────────────────────

/** An action button rendered in the `SidebarGroupAction` slot. */
export type NavGroupAction = {
	/** Icon component. */
	icon: LucideIcon
	/** Accessible label rendered as `sr-only` text. */
	srLabel?: string
	/** Click handler. */
	onClick?: React.MouseEventHandler<HTMLButtonElement>
}

// ─── Group ────────────────────────────────────────────────────────────────────

/**
 * A titled section grouping related navigation items.
 * Corresponds to `SidebarGroup`.
 *
 * Set `collapsible: true` to wrap the group in a `Collapsible` and make the
 * label act as the trigger.
 */
export type NavGroup = {
	/** Label rendered as `SidebarGroupLabel`. */
	label?: string
	/** Optional action button placed in the group header. */
	groupAction?: NavGroupAction
	/**
	 * When `true`, the entire group is wrapped in a `Collapsible` and the
	 * `label` becomes the collapse trigger.
	 */
	collapsible?: boolean
	/** Initial expansion state when `collapsible` is `true`. */
	defaultOpen?: boolean
	/** Ordered list of primary nav items — rendered in array order. */
	items: NavItem[]
	/** Required roles; every entry must be satisfied for the group to render. */
	allowedRoles?: MemberRole[]

	/** Color variant for the group. */
	colour?: 'default' | 'primary' | 'secondary' | 'accent' | 'destructive' | 'warning' | 'info' | 'success'
}

// ─── Config ───────────────────────────────────────────────────────────────────

/**
 * Full navigation configuration.
 * An ordered array of groups — rendered top-to-bottom in array order.
 */
export type NavConfig = NavGroup[]
