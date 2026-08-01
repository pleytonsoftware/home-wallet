'use client'

import { useEffect } from 'react'

import { ServerCrash } from 'lucide-react'
import { useTranslations } from 'next-intl'

import { Button } from '@atoms/button'
import { ErrorCodeBlock } from '@atoms/error-code-block'
import { ROUTES } from '@lib/constants/routes.const'
import { logger } from '@lib/logger'
import { StatusScreen } from '@molecules/status-screen'
import { Link } from '@navigation'

interface ErrorPageProps {
	error: Error & { digest?: string }
	reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
	const t = useTranslations('status')

	useEffect(() => {
		logger.error('Unhandled error boundary: {error}', { error })
	}, [error])

	return (
		<StatusScreen
			code='500'
			icon={ServerCrash}
			tone='destructive'
			title={t('error.title')}
			description={t('error.description')}
			contentUnderTitleNode={process.env.NODE_ENV === 'development' && <ErrorCodeBlock>{error.stack}</ErrorCodeBlock>}
		>
			<Button onClick={reset}>{t('cta.retry')}</Button>
			<Button asChild variant='outline'>
				<Link href={ROUTES.LANDING}>{t('cta.home')}</Link>
			</Button>
		</StatusScreen>
	)
}
