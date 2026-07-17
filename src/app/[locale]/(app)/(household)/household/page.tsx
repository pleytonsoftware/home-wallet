import { redirect } from 'next/navigation'

import { ROUTES } from '@lib/constants/routes.const'

export default function HouseholdPage() {
	redirect(ROUTES.HOUSEHOLDS)
}
