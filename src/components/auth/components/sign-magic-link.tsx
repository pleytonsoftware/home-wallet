import type { useMagicLinkForm } from '@auth/hooks/use-magic-link-form.hook'

import { type FC, useCallback } from 'react'

import { signIn } from 'next-auth/react'
import { useTranslations } from 'next-intl'
import { Controller } from 'react-hook-form'

import { Button } from '@atoms/button'
import { FieldError } from '@atoms/field'
import { Input } from '@atoms/input'
import { Spinner } from '@atoms/spinner'
import { ROUTES } from '@lib/constants/routes.const'

interface SignMagicLinkProps {
	setError: (error: string | null) => void
	disabled?: boolean
	form: ReturnType<typeof useMagicLinkForm>
}

export const SignMagicLink: FC<SignMagicLinkProps> = ({ setError, disabled, form }) => {
	const t = useTranslations('signin-page')
	const { handleSubmit, control, formState } = form

	const handleMagicLink = useCallback<Parameters<typeof handleSubmit>[0]>(async (data, e) => {
		e?.preventDefault()
		setError(null)

		await signIn('email', {
			email: data.email,
			callbackUrl: ROUTES.DASHBOARD,
		})
	}, [])

	return (
		<form onSubmit={handleSubmit(handleMagicLink)} className='flex flex-col gap-2' noValidate>
			<Controller
				name='email'
				control={control}
				render={({ field, fieldState, formState }) => (
					<>
						<Input
							{...field}
							type='email'
							placeholder='you@example.com'
							aria-invalid={fieldState.invalid}
							disabled={disabled || formState.isSubmitting}
							className='w-full'
						/>
						{fieldState.invalid && <FieldError errors={[fieldState.error]} />}
					</>
				)}
			/>
			<Button type='submit' disabled={disabled || formState.isSubmitting} variant='outline' size='lg' className='w-full'>
				{formState.isSubmitting ? (
					<>
						<Spinner /> {t('signing-in')}
					</>
				) : (
					<span className='capitalize'>{t('sign-with-email')}</span>
				)}
			</Button>
		</form>
	)
}
