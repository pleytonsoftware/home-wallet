import type { OnboardingOption } from '../types'

import Image from 'next/image'

import { useTranslations } from 'next-intl'

interface OnboardingHeaderProps {
	view: OnboardingOption
}

export const OnboardingHeader = ({ view }: OnboardingHeaderProps) => {
	const t = useTranslations('onboarding')

	return (
		<div className='space-y-2 text-center'>
			<Image src='/home-wallet.png' alt={`${process.env.NEXT_PUBLIC_APP_NAME} logo`} width={64} height={64} className='mx-auto pb-2' />
			<h1 className='text-3xl font-bold tracking-tight'>{t('title', { appName: process.env.NEXT_PUBLIC_APP_NAME! })}</h1>
			<p className='text-sm text-muted-foreground'>{t(`${view}.description`)}</p>
		</div>
	)
}
