import { useTranslations } from 'next-intl'

export const OnboardingCreateNote = () => {
	const t = useTranslations('onboarding.create')

	return (
		<div className='space-y-3 text-center text-sm text-muted-foreground'>
			<p>{t('note')}</p>
		</div>
	)
}
