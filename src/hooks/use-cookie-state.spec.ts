import { act, renderHook } from '@testing-library/react'

import { useCookieState } from './use-cookie-state'

describe('useCookieState', () => {
	afterEach(() => {
		document.cookie = 'view=; path=/; max-age=0'
	})

	it('initializes with the given value without writing a cookie', () => {
		const cookieSpy = vi.spyOn(document, 'cookie', 'set')
		const { result } = renderHook(() => useCookieState<'grid' | 'list'>('view', 'grid'))

		expect(result.current[0]).toBe('grid')
		expect(cookieSpy).not.toHaveBeenCalled()
	})

	it('updates the state when set', () => {
		const { result } = renderHook(() => useCookieState<'grid' | 'list'>('view', 'grid'))

		act(() => result.current[1]('list'))

		expect(result.current[0]).toBe('list')
	})

	it('writes the cookie with a default path and no max-age when set', () => {
		const cookieSpy = vi.spyOn(document, 'cookie', 'set')
		const { result } = renderHook(() => useCookieState<'grid' | 'list'>('view', 'grid'))

		act(() => result.current[1]('list'))

		expect(cookieSpy).toHaveBeenCalledWith('view=list; path=/')
	})

	it('includes max-age and a custom path when provided', () => {
		const cookieSpy = vi.spyOn(document, 'cookie', 'set')
		const { result } = renderHook(() => useCookieState<'grid' | 'list'>('view', 'grid', { path: '/app', maxAge: 3600 }))

		act(() => result.current[1]('list'))

		expect(cookieSpy).toHaveBeenCalledWith('view=list; path=/app; max-age=3600')
	})
})
