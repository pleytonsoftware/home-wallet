import type { FC } from 'react'

import Image from 'next/image'

import { cn } from '@cn'

interface LogoProps {
	text?: false
	className?: string
	textClassName?: string
	imgClassName?: string
}

export const Logo: FC<LogoProps> = ({ className, text = true, textClassName, imgClassName }) => (
	<div className={cn('space-y-0.5 text-center', className)}>
		<Image
			src='/home-wallet.png'
			alt={`${process.env.NEXT_PUBLIC_APP_NAME} logo`}
			width={64}
			height={64}
			className={cn('mx-auto pb-2', imgClassName)}
			title={process.env.NEXT_PUBLIC_APP_NAME}
		/>
		{text && <span className={cn('text-lg font-semibold font-title', textClassName)}>{process.env.NEXT_PUBLIC_APP_NAME}</span>}
	</div>
)
