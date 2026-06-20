import { useLocale } from 'next-intl'

import { renderHook } from '@testing-library/react'

import { useLanguage } from './use-language'

vi.mock('next-intl', () => ({
	useLocale: vi.fn(),
}))

describe('useLanguage', () => {
	it('returns the current locale as Languages type', () => {
		vi.mocked(useLocale).mockReturnValue('en')
		const { result } = renderHook(() => useLanguage())
		expect(result.current).toBe('en')
	})

	it('returns es locale', () => {
		vi.mocked(useLocale).mockReturnValue('es')
		const { result } = renderHook(() => useLanguage())
		expect(result.current).toBe('es')
	})

	it('calls useLocale', () => {
		vi.mocked(useLocale).mockReturnValue('en')
		renderHook(() => useLanguage())
		expect(useLocale).toHaveBeenCalled()
	})
})
