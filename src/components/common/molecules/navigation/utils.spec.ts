import type { NavConfig } from './types'

import { MemberRole } from '@lib/constants/role.enum'

import { hasAccessToNavItem, isNavUrlActive, resolveNavConfigActiveState } from './utils'

describe('hasAccessToNavItem', () => {
	it('allows items without allowedRoles', () => {
		expect(hasAccessToNavItem(MemberRole.MEMBER)({})).toBe(true)
	})

	it('denies gated items when no role is provided', () => {
		expect(hasAccessToNavItem(undefined)({ allowedRoles: [MemberRole.ADMIN] })).toBe(false)
	})

	it('matches a single current role', () => {
		expect(hasAccessToNavItem(MemberRole.ADMIN)({ allowedRoles: [MemberRole.ADMIN] })).toBe(true)
		expect(hasAccessToNavItem(MemberRole.MEMBER)({ allowedRoles: [MemberRole.ADMIN] })).toBe(false)
	})

	it('matches when the current roles array includes an allowed role', () => {
		expect(hasAccessToNavItem([MemberRole.MEMBER, MemberRole.ADMIN])({ allowedRoles: [MemberRole.ADMIN] })).toBe(true)
	})
})

describe('isNavUrlActive', () => {
	it('returns false for empty or placeholder urls', () => {
		expect(isNavUrlActive(undefined, '/a')).toBe(false)
		expect(isNavUrlActive('#', '/a')).toBe(false)
	})

	it('returns true on an exact match', () => {
		expect(isNavUrlActive('/settings/general', '/settings/general')).toBe(true)
	})

	it('returns true when the url is a parent segment of the pathname', () => {
		expect(isNavUrlActive('/settings', '/settings/general')).toBe(true)
	})

	it('does not match a partial segment prefix', () => {
		expect(isNavUrlActive('/settings/gen', '/settings/general')).toBe(false)
	})
})

describe('resolveNavConfigActiveState', () => {
	const config: NavConfig = [
		{
			label: 'Household',
			items: [
				{ title: 'Member', url: '/accounts' },
				{
					title: 'Settings',
					items: [
						{ title: 'General', url: '/household/1/settings/general' },
						{ title: 'Members', url: '/household/1/settings/members' },
					],
				},
			],
		},
	]

	it('marks the matching sub-item active and opens its parent', () => {
		const [group] = resolveNavConfigActiveState(config, '/household/1/settings/general')
		const settings = group.items[1]

		expect(settings.defaultOpen).toBe(true)
		expect(settings.isActive).toBe(true)
		expect(settings.items?.[0].isActive).toBe(true)
		expect(settings.items?.[1].isActive).toBeFalsy()
	})

	it('keeps the parent collapsed when no child matches', () => {
		const [group] = resolveNavConfigActiveState(config, '/accounts')
		const member = group.items[0]
		const settings = group.items[1]

		expect(member.isActive).toBe(true)
		expect(settings.defaultOpen).toBeFalsy()
		expect(settings.isActive).toBeFalsy()
	})

	it('does not mutate the original config', () => {
		const snapshot = JSON.parse(JSON.stringify(config))
		resolveNavConfigActiveState(config, '/household/1/settings/general')
		expect(config).toEqual(snapshot)
	})
})
