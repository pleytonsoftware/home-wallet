import type { FC, ReactNode } from 'react'

import { cn } from '@cn'

interface CircularProgressProps {
	/** 0-100+ — values above 100 render the ring fully filled in a destructive (over-budget) color. */
	value: number
	size?: number
	strokeWidth?: number
	className?: string
	children?: ReactNode
}

export const CircularProgress: FC<CircularProgressProps> = ({ value, size = 64, strokeWidth = 6, className, children }) => {
	const clamped = Math.min(Math.max(value, 0), 100)
	const isOverBudget = value > 100
	const radius = (size - strokeWidth) / 2
	const circumference = 2 * Math.PI * radius
	const offset = circumference - (clamped / 100) * circumference

	return (
		<div className={cn('relative inline-flex shrink-0 items-center justify-center', className)} style={{ width: size, height: size }}>
			<svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className='-rotate-90'>
				<circle cx={size / 2} cy={size / 2} r={radius} fill='none' strokeWidth={strokeWidth} className='stroke-muted' />
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					fill='none'
					strokeWidth={strokeWidth}
					strokeDasharray={circumference}
					strokeDashoffset={offset}
					strokeLinecap='round'
					className={cn('transition-[stroke-dashoffset] duration-300', isOverBudget ? 'stroke-destructive' : 'stroke-primary')}
				/>
			</svg>
			{children && <div className='absolute inset-0 flex items-center justify-center'>{children}</div>}
		</div>
	)
}
