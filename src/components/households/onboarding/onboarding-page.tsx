'use client'

import type { OnboardingOption } from './types'

import { useCallback, useState } from 'react'

import { signOut } from 'next-auth/react'
import { useTranslations } from 'next-intl'

import { Button } from '@atoms/button'
import { OnboardingCreate } from '@households/onboarding/components/onboarding-create'
import { OnboardingCreateNote } from '@households/onboarding/components/onboarding-create-note'
import { OnboardingHeader } from '@households/onboarding/components/onboarding-header'
import { OnboardingJoin } from '@households/onboarding/components/onboarding-join'
import { OnboardingProvider } from '@households/onboarding/context/onboarding.context'
import { ROUTES } from '@lib/constants/routes.const'

const OnboardingComponents: Record<OnboardingOption, React.FC> = {
	create: OnboardingCreate,
	join: OnboardingJoin,
}

export const OnboardingHouseholdPage = () => {
	const t = useTranslations('common')
	const [view, setView] = useState<OnboardingOption>('create')

	const handleSignOut = useCallback(() => signOut({ callbackUrl: ROUTES.SIGNIN }), [])
	const OnboardingComponent = OnboardingComponents[view]

	return (
		<OnboardingProvider value={{ view, setView }}>
			<div className='flex min-h-screen items-center justify-center bg-linear-to-br from-background to-muted p-4'>
				<div className='w-full max-w-md space-y-8'>
					<OnboardingHeader view={view} />
					<OnboardingComponent />

					{view === 'create' && <OnboardingCreateNote />}

					<div className='pt-4 text-center'>
						<Button
							variant='link'
							className='text-xs text-muted-foreground hover:text-destructive transition-colors hover:no-underline'
							onClick={handleSignOut}
						>
							{t('sign-out')}
						</Button>
					</div>
				</div>
			</div>
		</OnboardingProvider>
	)
}
