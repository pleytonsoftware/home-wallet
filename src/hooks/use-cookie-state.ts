'use client'

import { useCallback, useState } from 'react'

interface CookieStateOptions {
	path?: string
	maxAge?: number
}

/**
 * Like `useState`, but persists every update to a cookie. `initialValue` should come from a value
 * already read server-side (e.g. via `cookies()` in a Server Component and passed down as a prop),
 * so the client's first render matches what the server rendered instead of flashing a default
 * before the cookie can be read.
 */
export function useCookieState<T extends string>(
	name: string,
	initialValue: T,
	{ path = '/', maxAge }: CookieStateOptions = {},
): [T, (value: T) => void] {
	const [value, setValue] = useState(initialValue)

	const setCookieState = useCallback(
		(next: T) => {
			setValue(next)
			document.cookie = `${name}=${next}; path=${path}${maxAge !== undefined ? `; max-age=${maxAge}` : ''}`
		},
		[name, path, maxAge],
	)

	return [value, setCookieState]
}
