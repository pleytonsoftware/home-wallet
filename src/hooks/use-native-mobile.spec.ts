import { act, renderHook } from '@testing-library/react'

import { useIsNativeMobile } from './use-native-mobile'

function mockMatchMedia(initialMatches: boolean) {
	let matches = initialMatches
	const listeners = new Set<() => void>()
	const mql = {
		addEventListener: vi.fn((_event: string, cb: () => void) => listeners.add(cb)),
		removeEventListener: vi.fn((_event: string, cb: () => void) => listeners.delete(cb)),
	}
	Object.defineProperty(mql, 'matches', { get: () => matches })
	window.matchMedia = vi.fn(() => mql as unknown as MediaQueryList)

	return {
		mql,
		fireChange(value: boolean) {
			matches = value
			listeners.forEach((cb) => cb())
		},
	}
}

function mockUserAgent(ua: string) {
	vi.spyOn(window.navigator, 'userAgent', 'get').mockReturnValue(ua)
}

describe('useIsNativeMobile', () => {
	it('returns true for an iPhone user agent with a coarse pointer', () => {
		mockUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)')
		mockMatchMedia(true)

		const { result } = renderHook(() => useIsNativeMobile())
		expect(result.current).toBe(true)
	})

	it('returns true for an Android mobile user agent with a coarse pointer', () => {
		mockUserAgent('Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Mobile Safari/537.36')
		mockMatchMedia(true)

		const { result } = renderHook(() => useIsNativeMobile())
		expect(result.current).toBe(true)
	})

	it('returns false for a desktop user agent even with a coarse pointer', () => {
		mockUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36')
		mockMatchMedia(true)

		const { result } = renderHook(() => useIsNativeMobile())
		expect(result.current).toBe(false)
	})

	it('returns false for a phone user agent when the pointer is not coarse', () => {
		mockUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)')
		mockMatchMedia(false)

		const { result } = renderHook(() => useIsNativeMobile())
		expect(result.current).toBe(false)
	})

	it('recomputes when the pointer media query changes', () => {
		mockUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)')
		const { fireChange } = mockMatchMedia(false)

		const { result } = renderHook(() => useIsNativeMobile())
		expect(result.current).toBe(false)

		act(() => fireChange(true))
		expect(result.current).toBe(true)
	})

	it('recomputes on window resize', () => {
		mockUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)')
		mockMatchMedia(false)

		const { result } = renderHook(() => useIsNativeMobile())
		expect(result.current).toBe(false)

		mockMatchMedia(true)
		act(() => window.dispatchEvent(new Event('resize')))
		expect(result.current).toBe(true)
	})

	it('removes the media query and resize listeners on unmount', () => {
		mockUserAgent('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)')
		const { mql } = mockMatchMedia(true)
		const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

		const { unmount } = renderHook(() => useIsNativeMobile())
		unmount()

		expect(mql.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function))
		expect(removeEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function))
	})
})
