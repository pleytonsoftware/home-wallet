'use client'

import type { CurrencyCode } from 'currency-codes-ts/dist/types'

import axios from 'axios'
import { useIsClient, useLocalStorage } from 'usehooks-ts'

import { detectCurrency, FALLBACK_CURRENCY } from '@lib/utils/currency.utils'
import { useQuery } from '@tanstack/react-query'

/** Shape returned by the ipapi.co lookup; only `currency` is consumed today. */
interface IpApiResponse {
	ip: string
	version: string
	city: string
	region: string
	region_code: string
	country_code: string
	country_code_iso3: string
	country_name: string
	country_capital: string
	country_tld: string
	continent_code: string
	in_eu: boolean
	postal: string
	latitude: number
	longitude: number
	timezone: string
	utc_offset: string
	country_calling_code: string
	currency: string
	currency_name: string
	languages: string
	country_area: number
	country_population: number
	asn: string
	org: string
	hostname?: string
}

interface StoredDetectedCurrency {
	currency: CurrencyCode
	detectedAt: number
}

interface UseDetectedCurrencyResult {
	currency: CurrencyCode | undefined
	detectedAt: number | undefined
	isFetching: boolean
	error: unknown
	isError: boolean
}

export const IP_LOOKUP_URL = 'https://ipapi.co/json/'
export const STORAGE_KEY = 'detected-currency'
/** IP-based geolocation rarely changes within a day, so cache aggressively to conserve API calls. */
export const STALE_TIME = 1000 * 60 * 60 * 24

export const DETECTED_CURRENCY_QUERY_KEY = ['detected-currency'] as const

/**
 * Detect the user's currency based on their IP address or browser settings.
 * Falls back to `FALLBACK_CURRENCY` if detection fails.
 *
 * The result is persisted to `localStorage` so it survives reloads and is shared across tabs,
 * and is only refetched once it's older than `STALE_TIME`, keeping the IP lookup to roughly
 * once per day per browser.
 * @param fallback - The currency code to use if detection fails (default: `FALLBACK_CURRENCY`).
 * @returns The detected currency code, or the fallback currency code if detection fails.
 */
export const useDetectedCurrency = (fallback: CurrencyCode = FALLBACK_CURRENCY): UseDetectedCurrencyResult => {
	const [stored, setStored] = useLocalStorage<StoredDetectedCurrency | undefined>(STORAGE_KEY, undefined, {
		initializeWithValue: false,
	})
	const isClient = useIsClient()

	const { data, isFetching, error, isError } = useQuery({
		queryKey: DETECTED_CURRENCY_QUERY_KEY,
		queryFn: async () => {
			// Freshness is checked here (not during render) since `Date.now()` is impure.
			if (stored && Date.now() - stored.detectedAt <= STALE_TIME) return stored.currency

			let currency: CurrencyCode
			try {
				const response = await axios.get<IpApiResponse>(IP_LOOKUP_URL)
				if (response.status !== 200) throw new Error(`Failed to fetch currency: ${response.status}`)

				currency = (response.data.currency as CurrencyCode | undefined) ?? fallback
			} catch {
				currency = detectCurrency() ?? fallback
			}

			setStored({ currency, detectedAt: Date.now() })
			return currency
		},
		enabled: isClient,
		staleTime: STALE_TIME,
		gcTime: STALE_TIME,
	})

	return {
		currency: data,
		detectedAt: stored?.detectedAt,
		isFetching,
		error,
		isError,
	}
}
