import type { CurrencyCode, CurrencyCodeRecord } from 'currency-codes-ts/dist/types'

import { country, countries } from 'currency-codes-ts'

/**
 * ISO 4217 "funds"/complementary codes. These share a country with a real circulating currency
 * but must never be picked as the primary one (e.g. CHE "WIR Euro" sorts before CHF "Swiss Franc").
 */
const FUND_CODES = new Set<string>(['BOV', 'CHE', 'CHW', 'CLF', 'COU', 'MXV', 'USN', 'USS', 'UYI', 'UYW'])

/** Fallback when the browser region is unknown or has no resolvable currency. */
export const FALLBACK_CURRENCY = 'USD' satisfies CurrencyCode

/**
 * ISO 4217 country names use long forms — "United States of America (The)",
 * "United Kingdom of Great Britain and Northern Ireland (The)" — while `Intl.DisplayNames`
 * returns short ones ("United States"). Normalize both sides so they can be matched loosely.
 */
const normalizeCountryName = (name: string): string =>
	name
		.toLowerCase()
		.normalize('NFD')
		.replace(/[\u0300-\u036f]/g, '') // strip accents (e.g. Curaçao)
		.replace(/\(.*?\)/g, '') // drop parenthetical suffixes like "(The)"
		.replace(/[^a-z\s]/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()

/** True when one name is a word-boundary prefix of the other ("united states" ⊂ "united states of america"). */
const isPrefixWord = (a: string, b: string): boolean => {
	if (a === b) return true
	const [short, long] = a.length < b.length ? [a, b] : [b, a]
	return long.startsWith(`${short} `)
}

/** Prefer the first real circulating currency, skipping ISO 4217 funds codes. */
const pickPrimaryCode = (records: CurrencyCodeRecord[]): CurrencyCode | undefined =>
	(records.find((record) => !FUND_CODES.has(record.code)) ?? records[0])?.code

/**
 * Resolve an ISO 3166 region code (e.g. "ES", "US") to its primary ISO 4217 currency code,
 * or `undefined` when it cannot be determined.
 */
export const getCurrencyForRegion = (region: string): CurrencyCode | undefined => {
	let name: string | undefined
	try {
		// currency-codes-ts stores English country names, so resolve the display name in English.
		name = new Intl.DisplayNames(['en'], { type: 'region' }).of(region)
	} catch {
		return undefined
	}
	if (!name) return undefined

	const exact = country(name)
	if (exact.length) return pickPrimaryCode(exact)

	// Fall back to a normalized, word-boundary match for the long ISO 4217 forms (US, UK, …).
	const target = normalizeCountryName(name)
	const match = countries().find((candidate) => isPrefixWord(normalizeCountryName(candidate), target))
	return match ? pickPrimaryCode(country(match)) : undefined
}

/** Best-effort ISO 3166 region for the current browser; `undefined` on the server or when unknown. */
export const detectRegion = (): string | undefined => {
	if (typeof navigator === 'undefined') return undefined

	const source = navigator.languages?.[0] ?? navigator.language
	if (!source) return undefined

	try {
		return new Intl.Locale(source).maximize().region
	} catch {
		return undefined
	}
}

/** Detect the browser's likely currency; `undefined` on the server or when detection fails. */
export const detectCurrency = (): CurrencyCode | undefined => {
	const region = detectRegion()
	return region ? getCurrencyForRegion(region) : undefined
}
