import type { CurrencyCodeRecord } from 'currency-codes-ts/dist/types'

/**
 * Formats a currency amount based on the provided parameters.
 * @param amount The numeric amount to format.
 * @param currency The currency code (e.g., 'USD', 'EUR'). Defaults to 'USD'.
 * @param locale The locale string (e.g., 'en-US', 'fr-FR'). Defaults to the browser's language.
 * @param fractions The number of decimal places to display. Defaults to 0.
 * @returns A string representing the formatted currency amount.
 */
export const formatCurrency = (amount: number, currency = 'USD', locale = navigator.language, fractions: number = 0): string =>
	new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: fractions }).format(amount)

/**
 * Returns the display name of a currency based on the provided currency record and locale.
 * @param currency The currency record.
 * @param locale The locale string (e.g., 'en-US', 'fr-FR'). Defaults to the browser's language.
 * @returns The display name of the currency.
 */
export const getCurrencyName = (currency: CurrencyCodeRecord, locale = navigator.language): string => {
	const name = new Intl.DisplayNames([locale], {
		type: 'currency',
	}).of(currency.code)

	return name === currency.code ? currency.currency : (name ?? currency.currency)
}

/**
 * Returns the symbol of a currency based on the provided currency code and locale.
 * @param currencyCode The currency code (e.g., 'USD', 'EUR').
 * @param locale The locale string (e.g., 'en-US', 'fr-FR'). Defaults to the browser's language.
 * @returns The symbol of the currency.
 */
export const getCurrencySymbol = (currencyCode: string, locale = navigator.language): string => {
	const parts = new Intl.NumberFormat(locale, {
		style: 'currency',
		currency: currencyCode,
	}).formatToParts(0)

	return parts.find((part) => part.type === 'currency')?.value ?? currencyCode
}
