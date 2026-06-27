import { redirect } from 'next/navigation'

import { getServerSession } from 'next-auth'

import { SignPage } from '@auth/sign-page'
import { authOptions } from '@lib/auth'
import { ROUTES } from '@lib/constants/routes.const'

/**
 * Sign-in page
 * Public route - redirects authenticated users to home
 */
export default async function SignInPage() {
	const session = await getServerSession(authOptions)

	if (session?.user) {
		redirect(ROUTES.DASHBOARD)
	}

	return <SignPage />
}
