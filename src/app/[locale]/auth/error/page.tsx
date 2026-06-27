'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

import { Button } from '@atoms/button'
import { ROUTES } from '@lib/constants/routes.const'

const errorMessages: Record<string, string> = {
	Verification: 'The verification link is invalid or has expired. Please try signing in again.',
	EmailCreateAccount: 'Unable to create an account with this email. Please contact support.',
	OAuthSignin: 'Error connecting to the OAuth provider. Please try again.',
	OAuthCallback: 'Error during OAuth callback. Please try again.',
	OAuthProfile: 'Could not retrieve your profile from the OAuth provider.',
	CredentialsSignin: 'Invalid credentials. Please try again.',
	Default: 'An authentication error occurred. Please try again.',
}

export default function AuthErrorPage() {
	const searchParams = useSearchParams()
	const error = searchParams.get('error') || 'Default'
	const errorMessage = errorMessages[error] || errorMessages.Default

	return (
		<div className='flex min-h-screen items-center justify-center bg-linear-to-br from-background to-muted p-4'>
			<div className='w-full max-w-md space-y-6'>
				<div className='space-y-2 text-center'>
					<div className='mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center'>
						<svg className='h-6 w-6 text-destructive' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
							<path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
						</svg>
					</div>
					<h1 className='text-2xl font-bold tracking-tight'>Authentication Error</h1>
					<p className='text-sm text-muted-foreground'>{errorMessage}</p>
				</div>

				<div className='space-y-3'>
					<Link href={ROUTES.SIGNIN} className='block'>
						<Button className='w-full'>Try Signing In Again</Button>
					</Link>
					<Link href={ROUTES.LANDING} className='block'>
						<Button variant='outline' className='w-full'>
							Back to Home
						</Button>
					</Link>
				</div>
			</div>
		</div>
	)
}
