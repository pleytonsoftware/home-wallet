import { useState, useEffect } from 'react'

const PHONE_UA_REGEX = /Android.*Mobile|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i

export function useIsNativeMobile(): boolean {
	const getMatch = () => PHONE_UA_REGEX.test(navigator.userAgent) && window.matchMedia('(pointer: coarse)').matches

	const [isNativeMobile, setIsNativeMobile] = useState<boolean>(getMatch)

	useEffect(() => {
		const mql = window.matchMedia('(pointer: coarse)')
		const update = () => setIsNativeMobile(getMatch())

		mql.addEventListener('change', update)
		window.addEventListener('resize', update)

		return () => {
			mql.removeEventListener('change', update)
			window.removeEventListener('resize', update)
		}
	}, [])

	return isNativeMobile
}
