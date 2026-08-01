import { useSession } from 'next-auth/react'

import { renderHook } from '@testing-library/react'

import { useCurrentUser } from './use-current-user'

vi.mock('next-auth/react', () => ({
	useSession: vi.fn(),
}))

describe('useCurrentUser', () => {
	it('returns the session user', () => {
		vi.mocked(useSession).mockReturnValue({
			data: { user: { id: 'u1', name: 'Alice' } },
			status: 'authenticated',
		} as unknown as ReturnType<typeof useSession>)

		const { result } = renderHook(() => useCurrentUser())

		expect(result.current.user).toEqual({ id: 'u1', name: 'Alice' })
	})

	it('returns isAuthenticated true when the session status is authenticated', () => {
		vi.mocked(useSession).mockReturnValue({
			data: { user: { id: 'u1' } },
			status: 'authenticated',
		} as unknown as ReturnType<typeof useSession>)

		const { result } = renderHook(() => useCurrentUser())

		expect(result.current.isAuthenticated).toBe(true)
	})

	it('returns isAuthenticated false and an undefined user when unauthenticated', () => {
		vi.mocked(useSession).mockReturnValue({
			data: null,
			status: 'unauthenticated',
		} as unknown as ReturnType<typeof useSession>)

		const { result } = renderHook(() => useCurrentUser())

		expect(result.current.user).toBeUndefined()
		expect(result.current.isAuthenticated).toBe(false)
	})

	it('returns isAuthenticated false while the session is loading', () => {
		vi.mocked(useSession).mockReturnValue({
			data: null,
			status: 'loading',
		} as unknown as ReturnType<typeof useSession>)

		const { result } = renderHook(() => useCurrentUser())

		expect(result.current.isAuthenticated).toBe(false)
	})
})
