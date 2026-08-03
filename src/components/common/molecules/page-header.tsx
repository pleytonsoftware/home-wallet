import type { LucideIcon } from 'lucide-react'
import type { FC } from 'react'

import { Icon } from '@atoms/icon'

interface PageHeaderProps {
	icon: LucideIcon
	eyebrow: string
	title: string
	description: string
}

export const PageHeader: FC<PageHeaderProps> = ({ icon, eyebrow, title, description }) => (
	<div className='space-y-2'>
		<div className='flex items-center gap-1.5 text-sm font-semibold text-primary'>
			<Icon IconComponent={icon} size='sm' />
			<span className='tracking-wide uppercase'>{eyebrow}</span>
		</div>
		<h1 className='text-2xl font-bold tracking-tight sm:text-3xl'>{title}</h1>
		<p className='text-sm text-muted-foreground'>{description}</p>
	</div>
)
