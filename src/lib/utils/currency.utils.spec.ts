import { detectCurrency, detectRegion, FALLBACK_CURRENCY, getCurrencyForRegion } from './currency.utils'

function mockNavigatorLanguages(languages: string[]) {
	vi.spyOn(window.navigator, 'languages', 'get').mockReturnValue(languages)
}

function mockNavigatorLanguage(language: string) {
	vi.spyOn(window.navigator, 'language', 'get').mockReturnValue(language)
}

describe('getCurrencyForRegion', () => {
	it.each([
		['ES', 'EUR'],
		['DE', 'EUR'],
		['FR', 'EUR'],
		['MX', 'MXN'],
		['BR', 'BRL'],
		['JP', 'JPY'],
		['IN', 'INR'],
		['CA', 'CAD'],
		['AU', 'AUD'],
		['AR', 'ARS'],
	])('resolves an exact country-name match (%s -> %s)', (region, expected) => {
		expect(getCurrencyForRegion(region)).toBe(expected)
	})

	it.each([
		['US', 'USD'],
		['GB', 'GBP'],
	])('falls back to a normalized word-boundary match for long ISO 4217 names (%s -> %s)', (region, expected) => {
		expect(getCurrencyForRegion(region)).toBe(expected)
	})

	it('skips ISO 4217 fund/complementary codes in favor of the real circulating currency', () => {
		// Switzerland's currency-codes-ts records list CHE ("WIR Euro") before CHF ("Swiss Franc").
		expect(getCurrencyForRegion('CH')).toBe('CHF')
	})

	it.each([
		['CL', 'CLP'],
		['CO', 'COP'],
		['BO', 'BOB'],
		['UY', 'UYU'],
	])('picks the real currency over its fund code for %s -> %s', (region, expected) => {
		expect(getCurrencyForRegion(region)).toBe(expected)
	})

	it('returns undefined for an unrecognized region code', () => {
		expect(getCurrencyForRegion('XX')).toBeUndefined()
	})

	it('returns undefined when Intl.DisplayNames throws for a malformed region', () => {
		expect(getCurrencyForRegion('not-a-region!!!')).toBeUndefined()
	})
})

describe('detectRegion', () => {
	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('prefers the first entry of navigator.languages', () => {
		mockNavigatorLanguages(['es-ES', 'en-US'])
		mockNavigatorLanguage('en-US')

		expect(detectRegion()).toBe('ES')
	})

	it('falls back to navigator.language when navigator.languages is empty', () => {
		mockNavigatorLanguages([])
		mockNavigatorLanguage('fr-FR')

		expect(detectRegion()).toBe('FR')
	})

	it('maximizes a bare language tag into a region', () => {
		mockNavigatorLanguages(['ja'])

		expect(detectRegion()).toBe('JP')
	})

	it('returns undefined when the locale cannot be parsed', () => {
		mockNavigatorLanguages(['not a locale!!!'])

		expect(detectRegion()).toBeUndefined()
	})

	it('returns undefined when there is no navigator language available', () => {
		mockNavigatorLanguages([])
		mockNavigatorLanguage('')

		expect(detectRegion()).toBeUndefined()
	})
})

describe('detectCurrency', () => {
	afterEach(() => {
		vi.restoreAllMocks()
	})

	it('resolves the currency for the detected browser region', () => {
		mockNavigatorLanguages(['es-ES'])

		expect(detectCurrency()).toBe('EUR')
	})

	it('returns undefined when no region can be detected', () => {
		mockNavigatorLanguages(['not a locale!!!'])

		expect(detectCurrency()).toBeUndefined()
	})
})

describe('FALLBACK_CURRENCY', () => {
	it('is a valid, usable currency code', () => {
		expect(FALLBACK_CURRENCY).toBe('USD')
	})
})
