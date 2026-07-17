import type { FC, PropsWithChildren } from 'react'

import { Sparkles } from 'lucide-react'

import { Icon } from '@atoms/icon'

interface HouseholdsHeaderProps {
	eyebrow: string
	title: string
	description: string
}

export const HouseholdsHeader: FC<PropsWithChildren<HouseholdsHeaderProps>> = ({ eyebrow, title, description }) => (
	<div className='space-y-2'>
		<div className='flex items-center gap-1.5 text-sm font-semibold text-primary'>
			<Icon IconComponent={Sparkles} size='sm' />
			<span className='tracking-wide uppercase'>{eyebrow}</span>
		</div>
		<h1 className='text-2xl font-bold tracking-tight sm:text-3xl'>{title}</h1>
		<p className='text-sm text-muted-foreground'>{description}</p>
	</div>
)
