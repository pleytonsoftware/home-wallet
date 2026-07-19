import { ShieldX } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

import { Button } from '@atoms/button'
import { auth } from '@lib/auth'
import { ROUTES } from '@lib/constants/routes.const'
import { StatusScreen } from '@molecules/status-screen'
import { Link } from '@navigation'

export default async function Forbidden() {
	const t = await getTranslations('status')
	const session = await auth()

	return (
		<StatusScreen code='403' icon={ShieldX} title={t('forbidden.title')} description={t('forbidden.description')}>
			{session?.isAuthenticated && (
				<Button asChild>
					<Link href={ROUTES.HOUSEHOLDS}>{t('cta.households')}</Link>
				</Button>
			)}
			<Button asChild variant='outline'>
				<Link href={ROUTES.LANDING}>{t('cta.home')}</Link>
			</Button>
		</StatusScreen>
	)
}
