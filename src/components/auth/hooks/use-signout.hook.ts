import { useCallback } from 'react'

import { signOut } from 'next-auth/react'

import { ROUTES } from '@lib/constants/routes.const'

export const useSignOut = () => {
	return useCallback(() => {
		signOut({ callbackUrl: ROUTES.SIGNIN })
	}, [])
}
