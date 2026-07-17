'use client'

import { useCallback, type ComponentProps, type FC } from 'react'

import { useTranslations } from 'next-intl'

import { Button, type ButtonProps } from '@atoms/button'
import { useSignOut } from '@auth/hooks/use-signout.hook'

export const SignOutButton: FC<ButtonProps> = (props) => {
	const t = useTranslations('common')
	const signOut = useSignOut()
	const handleSignOut = useCallback((evt: React.MouseEvent<HTMLButtonElement>) => {
		signOut()
		props.onClick?.(evt)
	}, [])

	return (
		<Button onClick={handleSignOut as ButtonProps['onClick']} {...(props as ComponentProps<typeof Button>)}>
			{t('sign-out')}
		</Button>
	)
}
