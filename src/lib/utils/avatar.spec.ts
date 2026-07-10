import { UserGenderType } from '@/types/auth'

import { getInitials, getRandomUniqueAvatar } from './avatar'

describe('getRandomUniqueAvatar', () => {
	it('builds a url against the avatar api host', () => {
		const url = getRandomUniqueAvatar('jane@example.com')
		expect(url.startsWith('https://avatarapi.runflare.run/public')).toBe(true)
	})

	it('uses the local part of the email as the username param', () => {
		const url = getRandomUniqueAvatar('jane@example.com')
		expect(new URL(url).searchParams.get('username')).toBe('jane')
	})

	it('does not append a gender path when gender is omitted', () => {
		const url = getRandomUniqueAvatar('jane@example.com')
		expect(new URL(url).pathname).toBe('/public')
	})

	it('appends /boy for male gender', () => {
		const url = getRandomUniqueAvatar('john@example.com', UserGenderType.male)
		expect(new URL(url).pathname).toBe('/public/boy')
	})

	it('appends /girl for female gender', () => {
		const url = getRandomUniqueAvatar('jane@example.com', UserGenderType.female)
		expect(new URL(url).pathname).toBe('/public/girl')
	})

	it('keeps the username param alongside the gender path', () => {
		const url = getRandomUniqueAvatar('jane.doe@example.com', UserGenderType.female)
		expect(new URL(url).searchParams.get('username')).toBe('jane.doe')
	})

	it('uses the full local part when the email has no domain separator issues', () => {
		const url = getRandomUniqueAvatar('first.last+tag@example.com')
		expect(new URL(url).searchParams.get('username')).toBe('first.last+tag')
	})
})

describe('getInitials', () => {
	it('returns the first letter of a single name', () => {
		expect(getInitials('Jane')).toBe('J')
	})

	it('returns initials for a two-word name', () => {
		expect(getInitials('Jane Doe')).toBe('JD')
	})

	it('ignores extra names beyond the first two', () => {
		expect(getInitials('Jane Middle Doe')).toBe('JM')
	})

	it('uppercases lowercase initials', () => {
		expect(getInitials('jane doe')).toBe('JD')
	})

	it('collapses repeated whitespace between words', () => {
		expect(getInitials('Jane    Doe')).toBe('JD')
	})

	it('trims leading and trailing whitespace', () => {
		expect(getInitials('  Jane Doe  ')).toBe('JD')
	})

	it('returns an empty string for an empty name', () => {
		expect(getInitials('')).toBe('')
	})

	it('returns an empty string for a whitespace-only name', () => {
		expect(getInitials('   ')).toBe('')
	})
})
