import { FC } from 'react'

import { useTranslations } from 'next-intl'

import { HouseholdCard } from '@households/components/household-card'
import { HouseholdEmptyCard } from '@households/components/household-empty-card'
import { useHouseholdsContext } from '@households/context/households.context'
import { ROUTES } from '@lib/constants/routes.const'

export const HouseholdsGrid: FC = () => {
	const t = useTranslations('households-page')
	const { households } = useHouseholdsContext()

	return (
		<div className='grid gap-4 sm:grid-cols-2'>
			{households.map((household) => (
				<HouseholdCard key={household.id} household={household} href={ROUTES.HOUSEHOLD.ROOT.replace(':id', household.id)} />
			))}
			<HouseholdEmptyCard href={ROUTES.ONBOARDING.HOUSEHOLD} title={t('add-household.title')} description={t('add-household.description')} />
		</div>
	)
}
