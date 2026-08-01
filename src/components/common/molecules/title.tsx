import type { FC } from 'react'

interface TitleProps {
	title: string
	subtitle?: string
}

export const Title: FC<TitleProps> = ({ title, subtitle }) => (
	<header className='flex flex-col gap-1'>
		<h2 className='text-xl font-semibold'>{title}</h2>
		{subtitle && <p className='text-sm text-muted-foreground'>{subtitle}</p>}
	</header>
)
