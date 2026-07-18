'use client'

import type { FC } from 'react'

import { useState } from 'react'

import { useTranslations } from 'next-intl'

import { Separator } from '@atoms/separator'
import { SignWithGoogle } from '@auth/components/sign-google'
import { SignMagicLink } from '@auth/components/sign-magic-link'
import { useMagicLinkForm } from '@auth/hooks/use-magic-link-form.hook'
import { SignCard } from '@auth/sign-card'
import { SignForm } from '@auth/sign-form'
import { Logo } from '@molecules/logo'

export const SignPage: FC = () => {
	const t = useTranslations('signin-page')
	const form = useMagicLinkForm()
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	return (
		<SignCard
			imageUrl='/home-wallet-login.webp'
			imageAlt={process.env.NEXT_PUBLIC_APP_NAME}
			additionalContent={
				<div className='group absolute w-16 top-8 right-4'>
					<Logo
						className='[&>img]:w-7 relative'
						textClassName='absolute text-muted-foreground text-[10px] line-clamp-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out'
					/>
				</div>
			}
		>
			<SignForm isLoading={isLoading} error={error}>
				<div className='space-y-4 pb-2'>
					<h1 className='text-2xl font-bold tracking-tight'>{t('title')}</h1>
					<p className='text-sm text-muted-foreground'>{t('subtitle')}</p>
				</div>

				<SignMagicLink setError={setError} disabled={isLoading} form={form} />

				<Separator className='my-1'>
					<span className='px-2'>{t('sign-or')}</span>
				</Separator>
				<SignWithGoogle isLoading={isLoading} setIsLoading={setIsLoading} setError={setError} disabled={form.formState.isSubmitting} />
				<p className='text-xs text-muted-foreground pt-1'>{t('no-account-needed')}</p>
			</SignForm>
		</SignCard>
	)
}
