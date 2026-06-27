'use client'

import type { FC, PropsWithChildren } from 'react'

import { cn } from '@cn'

interface SignInFormProps {
	isLoading?: boolean
	error?: string | null
}

export const SignForm: FC<PropsWithChildren<SignInFormProps>> = ({ isLoading = false, error, children }) => {
	return (
		<div className={cn('flex flex-col gap-6', isLoading && 'opacity-50')}>
			{error && <div className='rounded-lg bg-destructive/10 p-3 text-sm text-destructive'>{error}</div>}
			<div className='flex flex-col gap-4' aria-disabled={isLoading}>
				{children}
			</div>
		</div>
	)
}
