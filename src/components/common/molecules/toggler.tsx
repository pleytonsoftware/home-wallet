'use client'

import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import { ButtonGroup } from '@atoms/button-group'
import { Icon } from '@atoms/icon'
import { ToggleGroup, ToggleGroupItem } from '@atoms/toggle-group'
import { Tooltip, TooltipContent, TooltipTrigger } from '@atoms/tooltip'
import { cn } from '@cn'

export interface TogglerOption<TValue extends string> {
	value: TValue
	label: ReactNode
	Icon?: LucideIcon
	disabled?: boolean
	tooltip?: ReactNode
	ariaLabel?: string
}

interface TogglerProps<TValue extends string> {
	value: TValue
	onChange: (value: TValue) => void
	options: Array<TogglerOption<TValue>>
	className?: string
	labelClassName?: string
	tooltipClassName?: string
	tooltipSide?: 'top' | 'right' | 'bottom' | 'left'
}

export const Toggler = <TValue extends string>({
	value,
	onChange,
	options,
	className,
	labelClassName,
	tooltipClassName,
	tooltipSide,
}: TogglerProps<TValue>) => (
	<ToggleGroup type='single' variant='outline' value={value} onValueChange={(next) => next && onChange(next as TValue)} className={className}>
		<ButtonGroup
			className={cn(
				'[&>[data-slot=toggle-group-item]:not(:first-child),&>*:not(:first-child)_[data-slot=toggle-group-item]]:rounded-l-none',
				'[&>[data-slot=toggle-group-item]:not(:first-child),&>*:not(:first-child)_[data-slot=toggle-group-item]]:border-l-0',
				'[&>[data-slot=toggle-group-item]:not(:last-child),&>*:not(:last-child)_[data-slot=toggle-group-item]]:rounded-r-none',
			)}
		>
			{options.map((option) => {
				const item = (
					<ToggleGroupItem
						value={option.value}
						key={`toggle-${option.value}`}
						disabled={option.disabled}
						aria-label={option.ariaLabel}
						className={cn(option.disabled && 'pointer-events-none')}
					>
						{option.Icon && <Icon IconComponent={option.Icon} size='sm' />}
						{option.label && <span className={labelClassName}>{option.label}</span>}
					</ToggleGroupItem>
				)

				if (!option.tooltip) return item

				return (
					<Tooltip key={`tooltip-${option.value}`}>
						<TooltipTrigger asChild>
							<span className='inline-flex' tabIndex={option.disabled ? 0 : undefined}>
								{item}
							</span>
						</TooltipTrigger>
						<TooltipContent side={tooltipSide} className={tooltipClassName}>
							{option.tooltip}
						</TooltipContent>
					</Tooltip>
				)
			})}
		</ButtonGroup>
	</ToggleGroup>
)
