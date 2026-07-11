import { useMediaQuery } from 'usehooks-ts'

import { renderHook } from '@testing-library/react'

import { useIsMobile } from './use-mobile'

vi.mock('usehooks-ts', () => ({
	useMediaQuery: vi.fn(),
}))

describe('useIsMobile', () => {
	it('queries the max-width matching one pixel below the sm breakpoint', () => {
		vi.mocked(useMediaQuery).mockReturnValue(false)
		renderHook(() => useIsMobile())
		expect(useMediaQuery).toHaveBeenCalledWith('(max-width: calc(40rem - 1px))')
	})

	it('returns true when the media query matches', () => {
		vi.mocked(useMediaQuery).mockReturnValue(true)
		const { result } = renderHook(() => useIsMobile())
		expect(result.current).toBe(true)
	})

	it('returns false when the media query does not match', () => {
		vi.mocked(useMediaQuery).mockReturnValue(false)
		const { result } = renderHook(() => useIsMobile())
		expect(result.current).toBe(false)
	})
})
