import type { OnboardingOption } from '@households/onboarding/types'

import { useTranslations } from 'next-intl'

import { Logo } from '@molecules/logo'

interface OnboardingHeaderProps {
	view: OnboardingOption
}

export const OnboardingHeader = ({ view }: OnboardingHeaderProps) => {
	const t = useTranslations('onboarding')

	return (
		<div className='space-y-2 text-center'>
			<Logo text={false} />
			<h1 className='text-3xl font-bold tracking-tight'>{t('title', { appName: process.env.NEXT_PUBLIC_APP_NAME! })}</h1>
			<p className='text-sm text-muted-foreground'>{t(`${view}.description`)}</p>
		</div>
	)
}
