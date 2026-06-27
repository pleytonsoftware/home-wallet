'use client'

import type { FC, PropsWithChildren } from 'react'

import Image from 'next/image'

interface SignInCardProps {
	imageUrl: string
	imageAlt?: string
}

export const SignCard: FC<PropsWithChildren<SignInCardProps>> = ({ imageUrl, imageAlt = 'Sign in', children }) => {
	return (
		<div className='grid min-h-screen grid-cols-1 lg:grid-cols-2'>
			<div className='relative hidden bg-muted lg:block'>
				<Image src={imageUrl} alt={imageAlt} fill className='object-cover' priority sizes='(max-width: 1024px) 100vw, 50vw' />
			</div>
			<div className='flex items-center justify-center p-6 sm:p-12'>
				<div className='w-full max-w-sm'>
					<div className='flex flex-col gap-6'>{children}</div>
				</div>
			</div>
		</div>
	)
}
