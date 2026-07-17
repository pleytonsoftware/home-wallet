import { redirect } from 'next/navigation'

import { hasActiveMemberships } from '@actions/household/active-memberships'
import { authorizedSession } from '@lib/auth/utils'
import { ROUTES } from '@lib/constants/routes.const'

/**
 * Shared guard for the `household` and `households` routes.
 * Redirects users without an active household membership to onboarding.
 * `onboarding` itself lives outside this group so it is never subject to this check.
 */
export default async function HouseholdGroupLayout({ children }: { children: React.ReactNode }) {
	const { session } = await authorizedSession()

	if (!(await hasActiveMemberships(session!.user.id))) {
		redirect(ROUTES.ONBOARDING.HOUSEHOLD)
	}

	return children
}
