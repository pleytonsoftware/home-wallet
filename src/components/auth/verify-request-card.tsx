'use client'

import Link from 'next/link'

import { MailCheck } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@atoms/button'
import { Icon } from '@atoms/icon'
import { ROUTES } from '@lib/constants/routes.const'

export const VerifyRequestCard = () => {
	const t = useTranslations('verify-request')

	return (
		<div className='flex min-h-screen items-center justify-center bg-linear-to-br from-background to-muted p-4'>
			<div className='w-full max-w-sm space-y-6 text-center'>
				<div className='mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10'>
					<Icon IconComponent={MailCheck} size='lg' className='text-primary' />
				</div>

				<div className='space-y-2'>
					<h1 className='text-2xl font-bold tracking-tight'>{t('title')}</h1>
					<p className='text-sm text-muted-foreground'>{t('subtitle')}</p>
				</div>

				<Button asChild variant='outline' shape='block'>
					<Link href={ROUTES.SIGNIN}>{t('back-to-sign-in')}</Link>
				</Button>
			</div>
		</div>
	)
}
