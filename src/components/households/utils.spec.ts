import type { CurrencyCodeRecord } from 'currency-codes-ts/dist/types'

import { formatCurrency, getCurrencyName, getCurrencySymbol } from './utils'

function mockNavigatorLanguage(language: string) {
	vi.spyOn(window.navigator, 'language', 'get').mockReturnValue(language)
}

describe('formatCurrency', () => {
	it('formats an amount with the default currency (USD) and no fraction digits', () => {
		expect(formatCurrency(1000, undefined, 'en-US')).toBe('$1,000')
	})

	it('formats an amount with a given currency and locale', () => {
		expect(formatCurrency(1000, 'EUR', 'de-DE')).toBe('1.000 €')
	})

	it('respects the fractions parameter', () => {
		expect(formatCurrency(1000.5, 'USD', 'en-US', 2)).toBe('$1,000.50')
	})

	it('falls back to navigator.language when no locale is provided', () => {
		mockNavigatorLanguage('en-US')

		expect(formatCurrency(1000)).toBe('$1,000')
	})
})

describe('getCurrencyName', () => {
	const usd: CurrencyCodeRecord = {
		code: 'USD',
		number: '840',
		digits: 2,
		currency: 'US Dollar',
		countries: ['United States of America (The)'],
	}

	it('returns the localized display name of the currency', () => {
		expect(getCurrencyName(usd, 'en-US')).toBe('US Dollar')
	})

	it('returns a locale-specific translated name', () => {
		expect(getCurrencyName(usd, 'es-ES')).toBe('dólar estadounidense')
	})

	it('falls back to the record currency name when Intl.DisplayNames returns the raw code', () => {
		class RawCodeDisplayNames {
			of(code: string) {
				return code
			}
		}
		vi.stubGlobal('Intl', { ...Intl, DisplayNames: RawCodeDisplayNames })

		expect(getCurrencyName(usd, 'en-US')).toBe('US Dollar')

		vi.unstubAllGlobals()
	})

	it('falls back to navigator.language when no locale is provided', () => {
		mockNavigatorLanguage('en-US')

		expect(getCurrencyName(usd)).toBe('US Dollar')
	})
})

describe('getCurrencySymbol', () => {
	it('returns the currency symbol for a given code and locale', () => {
		expect(getCurrencySymbol('USD', 'en-US')).toBe('$')
	})

	it('returns a locale-specific symbol', () => {
		expect(getCurrencySymbol('EUR', 'de-DE')).toBe('€')
	})

	it('throws for an invalid currency code', () => {
		expect(() => getCurrencySymbol('NOTREAL', 'en-US')).toThrow(RangeError)
	})

	it('falls back to navigator.language when no locale is provided', () => {
		mockNavigatorLanguage('en-US')

		expect(getCurrencySymbol('USD')).toBe('$')
	})
})
