import type { FC } from 'react'

import Image from 'next/image'

import { cn } from '@cn'

interface LogoProps {
	text?: false
	className?: string
	textClassName?: string
}

export const Logo: FC<LogoProps> = ({ className, text = true, textClassName }) => (
	<div className={cn('space-y-0.5 text-center', className)}>
		<Image
			src='/home-wallet.png'
			alt={`${process.env.NEXT_PUBLIC_APP_NAME} logo`}
			width={64}
			height={64}
			className='mx-auto pb-2'
			title={process.env.NEXT_PUBLIC_APP_NAME}
		/>
		{text && <span className={cn('text-lg font-semibold font-title', textClassName)}>{process.env.NEXT_PUBLIC_APP_NAME}</span>}
	</div>
)
