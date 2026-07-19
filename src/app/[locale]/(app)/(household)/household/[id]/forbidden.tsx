import { ShieldAlert } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import { StatusScreen } from '@molecules/status-screen'

export default async function HouseholdForbiddenPage() {
	const t = await getTranslations('status')

	return (
		<StatusScreen variant='panel' icon={ShieldAlert} title={t('household-forbidden.title')} description={t('household-forbidden.description')} />
	)
}
