import type { EmptyObject, LayoutProps } from '@/types/app'

import { redirect } from 'next/navigation'

import { ROUTES } from '@lib/constants/routes.const'

export default async function HouseholdSettingsPage({ params }: LayoutProps<EmptyObject, { id: string }>) {
	const { id } = await params

	redirect(ROUTES.HOUSEHOLD.SETTINGS.GENERAL.replace(':id', id))
}
