import type { LucideIcon } from 'lucide-react'
import type { FC, ReactNode } from 'react'

import { Icon } from '@atoms/icon'
import { cn } from '@cn'

type StatusTone = 'default' | 'destructive'
type StatusVariant = 'hero' | 'panel'

interface StatusScreenProps {
	/** Big ghost numeral rendered behind the content, e.g. "404". Only shown in the `hero` variant. */
	code?: string
	/** Lucide icon shown in the circular badge. */
	icon: LucideIcon
	title: string
	description: string
	/** Tints the icon badge and numeral accent. */
	tone?: StatusTone
	/**
	 * `hero` — full-bleed branded screen with a giant numeral (public / pre-auth pages).
	 * `panel` — a contained card that sits inside the app chrome (in-app boundaries).
	 */
	variant?: StatusVariant
	/** CTA buttons row. */
	children?: ReactNode

	contentUnderTitleNode?: ReactNode
}

const toneStyles: Record<StatusTone, { badge: string; numeral: string }> = {
	default: {
		badge: 'bg-primary/10 text-primary',
		numeral: 'text-foreground/[0.04] dark:text-foreground/[0.05]',
	},
	destructive: {
		badge: 'bg-destructive/10 text-destructive',
		numeral: 'text-destructive/[0.05] dark:text-destructive/[0.06]',
	},
}

export const StatusScreen: FC<StatusScreenProps> = ({
	code,
	icon,
	title,
	description,
	tone = 'default',
	variant = 'hero',
	children,
	contentUnderTitleNode,
}) => {
	const tones = toneStyles[tone]

	const content = (
		<>
			<div className={cn('mx-auto flex size-12 items-center justify-center rounded-full', tones.badge)}>
				<Icon IconComponent={icon} size='lg' />
			</div>

			<div className='space-y-2'>
				<h1 className='text-2xl font-bold tracking-tight'>{title}</h1>
				<p className='text-sm text-muted-foreground'>{description}</p>
				{contentUnderTitleNode}
			</div>

			{children && <div className='flex flex-col justify-center gap-3 sm:flex-row'>{children}</div>}
		</>
	)

	if (variant === 'panel') {
		return (
			<div className='flex min-h-[60vh] flex-1 items-center justify-center p-6'>
				<div className='w-full max-w-md space-y-6 rounded-2xl border bg-card p-8 text-center shadow-xs'>{content}</div>
			</div>
		)
	}

	return (
		<div className='relative flex flex-1 items-center justify-center overflow-hidden bg-linear-to-br from-background to-muted p-6'>
			{code && (
				<span
					aria-hidden
					className={cn(
						'pointer-events-none absolute inset-0 flex select-none items-center justify-center font-title text-[40vw] font-bold leading-none',
						tones.numeral,
					)}
				>
					{code}
				</span>
			)}

			<div className='relative z-10 w-full max-w-xl space-y-6 text-center'>{content}</div>
		</div>
	)
}
