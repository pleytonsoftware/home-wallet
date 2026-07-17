import type { PropsWithChildren } from 'react'

import axios from 'axios'

import { detectCurrency } from '@lib/utils/currency.utils'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'

import { DETECTED_CURRENCY_QUERY_KEY, IP_LOOKUP_URL, useDetectedCurrency, STORAGE_KEY } from './use-detected-currency'

vi.mock('axios', () => ({
	default: { get: vi.fn() },
}))

vi.mock('@lib/utils/currency.utils', async (importOriginal) => ({
	...(await importOriginal<typeof import('@lib/utils/currency.utils')>()),
	detectCurrency: vi.fn(),
}))

function createWrapper() {
	const queryClient = new QueryClient({
		defaultOptions: { queries: { retry: false, gcTime: Infinity } },
	})

	function Wrapper({ children }: PropsWithChildren) {
		return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
	}

	return Wrapper
}

describe('useDetectedCurrency', () => {
	afterEach(() => {
		vi.clearAllMocks()
		window.localStorage.clear()
	})

	it('returns an undefined currency and isFetching while the request is pending', async () => {
		vi.mocked(axios.get).mockReturnValue(new Promise(() => {})) // never resolves

		const { result } = renderHook(() => useDetectedCurrency('EUR'), { wrapper: createWrapper() })

		await waitFor(() => expect(result.current.isFetching).toBe(true))
		expect(result.current.currency).toBeUndefined()
		expect(result.current.isError).toBe(false)
	})

	it('adopts the currency returned by the IP lookup on success', async () => {
		vi.mocked(axios.get).mockResolvedValue({ status: 200, data: { currency: 'JPY' } })

		const { result } = renderHook(() => useDetectedCurrency('EUR'), { wrapper: createWrapper() })

		await waitFor(() => expect(result.current.currency).toBe('JPY'))
		expect(result.current.isFetching).toBe(false)
		expect(result.current.isError).toBe(false)
	})

	it('falls back to the fallback currency when the response has no currency field', async () => {
		vi.mocked(axios.get).mockResolvedValue({ status: 200, data: {} })

		const { result } = renderHook(() => useDetectedCurrency('GBP'), { wrapper: createWrapper() })

		await waitFor(() => expect(result.current.currency).toBe('GBP'))
	})

	it('falls back to FALLBACK_CURRENCY when no fallback argument is given and the response has no currency field', async () => {
		vi.mocked(axios.get).mockResolvedValue({ status: 200, data: {} })

		const { result } = renderHook(() => useDetectedCurrency(), { wrapper: createWrapper() })

		await waitFor(() => expect(result.current.currency).toBe('USD'))
	})

	it('requests the ipapi.co lookup endpoint', async () => {
		vi.mocked(axios.get).mockReturnValue(new Promise(() => {}))

		renderHook(() => useDetectedCurrency(), { wrapper: createWrapper() })

		await waitFor(() => expect(axios.get).toHaveBeenCalledWith(IP_LOOKUP_URL))
	})

	it('falls back to browser-based detection when the request throws synchronously', async () => {
		vi.mocked(axios.get).mockImplementation(() => {
			throw new Error('network unavailable')
		})
		vi.mocked(detectCurrency).mockReturnValue('CAD')

		const { result } = renderHook(() => useDetectedCurrency('EUR'), { wrapper: createWrapper() })

		await waitFor(() => expect(result.current.currency).toBe('CAD'))
	})

	it('keeps the fallback when the synchronous-throw path detects the same currency', async () => {
		vi.mocked(axios.get).mockImplementation(() => {
			throw new Error('network unavailable')
		})
		vi.mocked(detectCurrency).mockReturnValue('EUR')

		const { result } = renderHook(() => useDetectedCurrency('EUR'), { wrapper: createWrapper() })

		await waitFor(() => expect(result.current.currency).toBe('EUR'))
	})

	it('keeps the fallback when the synchronous-throw path cannot detect a currency', async () => {
		vi.mocked(axios.get).mockImplementation(() => {
			throw new Error('network unavailable')
		})
		vi.mocked(detectCurrency).mockReturnValue(undefined)

		const { result } = renderHook(() => useDetectedCurrency('EUR'), { wrapper: createWrapper() })

		await waitFor(() => expect(result.current.currency).toBe('EUR'))
	})

	it('persists the resolved currency to localStorage so it can seed the cache on the next load', async () => {
		vi.mocked(axios.get).mockResolvedValue({ status: 200, data: { currency: 'JPY' } })

		renderHook(() => useDetectedCurrency('EUR'), { wrapper: createWrapper() })

		await waitFor(() => {
			const stored = window.localStorage.getItem(STORAGE_KEY)
			expect(stored && JSON.parse(stored).currency).toBe('JPY')
		})
	})

	it('resolves from a previously stored currency without hitting the network', async () => {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ currency: 'JPY', detectedAt: Date.now() }))
		vi.mocked(axios.get).mockReturnValue(new Promise(() => {})) // never resolves

		const { result } = renderHook(() => useDetectedCurrency('EUR'), { wrapper: createWrapper() })

		await waitFor(() => expect(result.current.currency).toBe('JPY'))
		expect(axios.get).not.toHaveBeenCalled()
	})

	it('exposes the stored detection timestamp', async () => {
		const detectedAt = Date.now()
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ currency: 'JPY', detectedAt }))
		vi.mocked(axios.get).mockReturnValue(new Promise(() => {}))

		const { result } = renderHook(() => useDetectedCurrency('EUR'), { wrapper: createWrapper() })

		await waitFor(() => expect(result.current.detectedAt).toBe(detectedAt))
	})

	it('does not refetch when the stored currency is still fresh', async () => {
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ currency: 'JPY', detectedAt: Date.now() }))
		vi.mocked(axios.get).mockReturnValue(new Promise(() => {}))

		const { result } = renderHook(() => useDetectedCurrency('EUR'), { wrapper: createWrapper() })

		await waitFor(() => expect(result.current.currency).toBe('JPY'))
		expect(axios.get).not.toHaveBeenCalled()
	})

	it('refetches when the stored currency is older than the stale window', async () => {
		const oneDayMs = 1000 * 60 * 60 * 24
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ currency: 'JPY', detectedAt: Date.now() - oneDayMs - 1 }))
		vi.mocked(axios.get).mockResolvedValue({ status: 200, data: { currency: 'CAD' } })

		const { result } = renderHook(() => useDetectedCurrency('EUR'), { wrapper: createWrapper() })

		await waitFor(() => expect(result.current.currency).toBe('CAD'))
		expect(axios.get).toHaveBeenCalledWith(IP_LOOKUP_URL)
	})

	it('exposes a stable query key for the detected currency cache', () => {
		expect(DETECTED_CURRENCY_QUERY_KEY).toEqual(['detected-currency'])
	})
})
