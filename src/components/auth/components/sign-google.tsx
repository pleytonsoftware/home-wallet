import { useSearchParams } from 'next/navigation'
import { type FC, useCallback } from 'react'

import { signIn } from 'next-auth/react'
import { useTranslations } from 'next-intl'

import GoogleIcon from '@assets/icons/google.svg'
import { Button } from '@atoms/button'
import { Spinner } from '@atoms/spinner'
import { getCallbackUrl } from '@auth/callback-url.utils'

interface SignWithGoogleProps {
	isLoading: boolean
	setIsLoading: (loading: boolean) => void
	setError: (error: string | null) => void
	disabled?: boolean
}

export const SignWithGoogle: FC<SignWithGoogleProps> = ({ isLoading, setIsLoading, setError, disabled }) => {
	const t = useTranslations('signin-page')
	const searchParams = useSearchParams()
	const callbackUrl = getCallbackUrl(searchParams)

	const handleGoogleSignIn = useCallback(async (): Promise<void> => {
		try {
			setIsLoading(true)
			setError(null)
			await signIn('google', { callbackUrl })
		} catch (err) {
			setError(err instanceof Error ? err.message : t('failed-to-sign-in'))
			setIsLoading(false)
		}
	}, [callbackUrl, t])

	return (
		<Button onClick={handleGoogleSignIn} disabled={isLoading || disabled} size='lg' className='w-full'>
			<span className='flex items-center justify-center gap-2'>
				{isLoading ? (
					<>
						<Spinner />
						{t('signing-in')}
					</>
				) : (
					<>
						<GoogleIcon />
						{t('sign-with-google')}
					</>
				)}
			</span>
		</Button>
	)
}
