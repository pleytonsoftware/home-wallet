import type { MemberRole } from '@lib/constants/role.enum'
import type { NavConfig, NavItem } from './types'

export const hasAccessToNavItem = (currentRoles?: MemberRole[] | MemberRole) => (item: Pick<NavItem, 'allowedRoles'>) => {
	if (!item.allowedRoles) return true
	if (!currentRoles || currentRoles.length === 0) return false

	return item.allowedRoles.some((role) => {
		if (Array.isArray(currentRoles)) {
			return currentRoles.includes(role)
		}
		return currentRoles === role
	})
}

/**
 * Whether `url` matches the current `pathname` — an exact match or a parent
 * segment of it (so `/settings` stays active on `/settings/general`).
 * Placeholder/non-navigable urls (`#`) are never active.
 */
export const isNavUrlActive = (url: string | undefined, pathname: string): boolean => {
	if (!url || url === '#') return false
	return pathname === url || pathname.startsWith(`${url}/`)
}

/**
 * Returns a copy of the nav config with `isActive`/`defaultOpen` derived from the
 * current `pathname`, so the sidebar highlights the current route and keeps the
 * parent of an active sub-item expanded. Explicit `isActive`/`defaultOpen` values
 * in the config are preserved as a fallback (URL match wins when present).
 */
export const resolveNavConfigActiveState = (config: NavConfig, pathname: string): NavConfig =>
	config.map((group) => ({
		...group,
		items: group.items.map((item) => {
			if (item.items?.length) {
				const items = item.items.map((subItem) => ({
					...subItem,
					isActive: isNavUrlActive(subItem.url, pathname) || subItem.isActive,
				}))
				const hasActiveChild = items.some((subItem) => subItem.isActive)

				return {
					...item,
					items,
					isActive: hasActiveChild || isNavUrlActive(item.url, pathname) || item.isActive,
					defaultOpen: hasActiveChild || item.defaultOpen,
				}
			}

			return {
				...item,
				isActive: isNavUrlActive(item.url, pathname) || item.isActive,
			}
		}),
	}))

export const navItemColourMap: Record<NonNullable<NavItem['colour']>, string> = {
	default: '',
	primary: '!text-primary',
	secondary: '!text-secondary',
	accent: '!text-accent',
	destructive: '!text-destructive',
	warning: '!text-warning',
	info: '!text-info',
	success: '!text-success',
}

/**
 * Checks whether a given URL is absolute (i.e. includes a scheme such as
 * `http:`/`https:` or is protocol-relative, e.g. `//example.com`).
 */
export function isAbsoluteUrl(url: string) {
	return /^([a-z][a-z0-9+.-]*:)?\/\//i.test(url)
}
